package com.mindhub.homebanking;

import com.mindhub.homebanking.models.Account;
import com.mindhub.homebanking.models.Client;
import com.mindhub.homebanking.models.Transaction;
import com.mindhub.homebanking.repositories.AccountRepository;
import com.mindhub.homebanking.repositories.ClientRepository;
import com.mindhub.homebanking.repositories.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;

import static com.mindhub.homebanking.models.TransactionType.CREDIT;
import static com.mindhub.homebanking.models.TransactionType.DEBIT;

@SpringBootApplication
public class HomebankingApplication {

	public static void main(String[] args) {
		SpringApplication.run(HomebankingApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(ClientRepository clientRepository, AccountRepository accountRepository, TransactionRepository transactionRepository) {
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
		};
	}

}
