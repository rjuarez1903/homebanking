package com.mindhub.homebanking;

import com.mindhub.homebanking.models.*;
import com.mindhub.homebanking.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

import static com.mindhub.homebanking.models.TransactionType.CREDIT;
import static com.mindhub.homebanking.models.TransactionType.DEBIT;

@SpringBootApplication
public class HomebankingApplication {

	@Autowired
	PasswordEncoder passwordEncoder;
	@Autowired
	CardRepository cardRepository;

	public static void main(String[] args) {
		SpringApplication.run(HomebankingApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(ClientRepository clientRepository,
									  AccountRepository accountRepository,
									  TransactionRepository transactionRepository,
									  LoanRepository loanRepository,
									  ClientLoanRepository clientLoanRepository,
									  CardRepository cardRepository) {
		return (args) -> {
			Client client1 = new Client("Melba", "Morel", "melba@mindhub.com", passwordEncoder.encode("pass1234"));
			Client client2 = new Client("Rodrigo", "Juarez", "lic.rodrigojuarez@gmail.com", passwordEncoder.encode("pass4321"));
			Client client3 = new Client("Admin", "Admin", "admin@admin.com", passwordEncoder.encode("admin"));

			Account account1 = new Account("VIN001", LocalDateTime.now(), 5000, AccountType.CHECKING);
			Account account2 = new Account("VIN002", LocalDateTime.now().plusDays(1), 7500, AccountType.SAVINGS);
			Account account3 = new Account("VIN003", LocalDateTime.now().plusDays(1), 8500, AccountType.CHECKING);

			Transaction transaction1 = new Transaction(CREDIT, 7510.25, "Test transaction", LocalDateTime.now().plusMinutes(75));
			Transaction transaction2 = new Transaction(DEBIT, -1500.99, "Test transaction 2", LocalDateTime.now().plusMinutes(30));
			Transaction transaction3 = new Transaction(DEBIT, -1580.69, "Test transaction 3", LocalDateTime.now().plusDays(20));
			Transaction transaction4 = new Transaction(CREDIT, 2580.69, "Test transaction 4", LocalDateTime.now());
			Transaction transaction5 = new Transaction(DEBIT, -4580.69, "Test transaction 5", LocalDateTime.now().plusDays(10));

			Loan loan1 = new Loan("Mortgage", 500_000, List.of(12,24,36,48,60));
			Loan loan2 = new Loan("Personal", 100_000, List.of(6,12,24));
			Loan loan3 = new Loan("Car", 300_000, List.of(6,12,24,36));

			ClientLoan clientLoan1 = new ClientLoan(400_000.0, (byte) 60);
			ClientLoan clientLoan2 = new ClientLoan(50_000.0, (byte) 12);
			ClientLoan clientLoan3 = new ClientLoan(100_000.0, (byte) 24);
			ClientLoan clientLoan4 = new ClientLoan(200_000.0, (byte) 36);

			LocalDateTime creation = LocalDateTime.now().minusYears(5);
			LocalDateTime expiration = creation.plusYears(5).plusMinutes(2);

			Card card1 = new Card(CardType.CREDIT, CardColor.GOLD, "1111222233334444", "123", creation, expiration, client1);
			Card card2 = new Card(CardType.CREDIT, CardColor.SILVER, "4444333322221111", "456", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client1);
			Card card3 = new Card(CardType.CREDIT, CardColor.TITANIUM, "3232414154546565", "789", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client1);
			Card card4 = new Card(CardType.DEBIT, CardColor.GOLD, "2020989810102929", "321", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client1);
			Card card5 = new Card(CardType.CREDIT, CardColor.SILVER, "5555666677778888", "567", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client2);

			client1.addAccount(account1);
			client1.addAccount(account2);
			client2.addAccount(account3);

			client1.addCard(card1);
			client1.addCard(card2);
			client1.addCard(card3);
			client1.addCard(card4);
			client2.addCard(card5);

			client1.addClientLoan(clientLoan1);
			client1.addClientLoan(clientLoan2);
			client2.addClientLoan(clientLoan3);
			client2.addClientLoan(clientLoan4);

			loan1.addClientLoan(clientLoan1);
			loan2.addClientLoan(clientLoan2);
			loan2.addClientLoan(clientLoan3);
			loan3.addClientLoan(clientLoan4);

			account1.addTransaction(transaction1);
			account1.addTransaction(transaction2);
			account1.addTransaction(transaction3);
			account3.addTransaction(transaction4);
			account3.addTransaction(transaction5);

			clientRepository.saveAll(List.of(client1, client2, client3));

			accountRepository.saveAll(List.of(account1, account2, account3));

			transactionRepository.saveAll(List.of(transaction1, transaction2, transaction3, transaction4, transaction5));

			loanRepository.saveAll(List.of(loan1, loan2, loan3));

			clientLoanRepository.saveAll(List.of(clientLoan1, clientLoan2, clientLoan3, clientLoan4));

			cardRepository.saveAll(List.of(card1, card2, card3, card4, card5));

		};
	}

}
