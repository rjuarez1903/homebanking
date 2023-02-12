package com.mindhub.homebanking;

import com.mindhub.homebanking.models.*;
import com.mindhub.homebanking.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;
import java.util.List;

import static com.mindhub.homebanking.models.TransactionType.CREDIT;
import static com.mindhub.homebanking.models.TransactionType.DEBIT;

@SpringBootApplication
public class HomebankingApplication {
	private final CardRepository cardRepository;

	public HomebankingApplication(CardRepository cardRepository) {
		this.cardRepository = cardRepository;
	}

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
			Client client1 = new Client("Melba", "Morel", "melba@mindhub.com");
			Client client2 = new Client("Rodrigo", "Juarez", "lic.rodrigojuarez@gmail.com");

			Account account1 = new Account("VIN001", LocalDateTime.now(), 5000);
			Account account2 = new Account("VIN002", LocalDateTime.now().plusDays(1), 7500);
			Account account3 = new Account("VIN003", LocalDateTime.now().plusDays(1), 8500);

			Transaction transaction1 = new Transaction(CREDIT, 7510.25, "Test transaction", LocalDateTime.now().plusMinutes(75));
			Transaction transaction2 = new Transaction(DEBIT, -1500.99, "Test transaction 2", LocalDateTime.now().plusMinutes(30));
			Transaction transaction3 = new Transaction(DEBIT, -1580.69, "Test transaction 3", LocalDateTime.now().plusDays(20));
			Transaction transaction4 = new Transaction(CREDIT, 2580.69, "Test transaction 4", LocalDateTime.now());
			Transaction transaction5 = new Transaction(DEBIT, -4580.69, "Test transaction 5", LocalDateTime.now().plusDays(10));

			Loan loan1 = new Loan("Mortgage", 500_000, List.of(12,24,36,48,60));
			Loan loan2 = new Loan("Personal", 100_000, List.of(6,12,24));
			Loan loan3 = new Loan("Car", 300_000, List.of(6,12,24,36));

			ClientLoan clientLoan1 = new ClientLoan(400_000.0, (byte) 60, client1, loan1);
			ClientLoan clientLoan2 = new ClientLoan(50_000.0, (byte) 12, client1, loan2);
			ClientLoan clientLoan3 = new ClientLoan(100_000.0, (byte) 24, client2, loan2);
			ClientLoan clientLoan4 = new ClientLoan(200_000.0, (byte) 36, client2, loan3);

			Card card1 = new Card(CardType.DEBIT, CardColor.GOLD, "1111222233334444", "123", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client1);
			Card card2 = new Card(CardType.CREDIT, CardColor.TITANIUM, "4444333322221111", "321", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client1);
			Card card2a = new Card(CardType.CREDIT, CardColor.TITANIUM, "4444333322221111", "321", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client1);
			Card card2b = new Card(CardType.CREDIT, CardColor.TITANIUM, "4444333322221111", "321", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client1);
			Card card2c = new Card(CardType.CREDIT, CardColor.TITANIUM, "4444333322221111", "321", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client1);
			Card card2d = new Card(CardType.CREDIT, CardColor.TITANIUM, "4444333322221111", "321", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client1);
			Card card3 = new Card(CardType.CREDIT, CardColor.SILVER, "5555666677778888", "567", LocalDateTime.now(), LocalDateTime.now().plusYears(5), client2);

			client1.addAccount(account1);
			client1.addAccount(account2);
			client2.addAccount(account3);

			account1.addTransaction(transaction1);
			account1.addTransaction(transaction2);
			account1.addTransaction(transaction3);
			account3.addTransaction(transaction4);
			account3.addTransaction(transaction5);

			clientRepository.save(client1);
			clientRepository.save(client2);

			accountRepository.save(account1);
			accountRepository.save(account2);
			accountRepository.save(account3);

			transactionRepository.save(transaction1);
			transactionRepository.save(transaction2);
			transactionRepository.save(transaction3);
			transactionRepository.save(transaction4);
			transactionRepository.save(transaction5);

			loanRepository.save(loan1);
			loanRepository.save(loan2);
			loanRepository.save(loan3);

			clientLoanRepository.save(clientLoan1);
			clientLoanRepository.save(clientLoan2);
			clientLoanRepository.save(clientLoan3);
			clientLoanRepository.save(clientLoan4);

			cardRepository.save(card1);
			cardRepository.save(card2);
			cardRepository.save(card2a);
			cardRepository.save(card2b);
			cardRepository.save(card2c);
			cardRepository.save(card2d);
			cardRepository.save(card3);
		};
	}

}
