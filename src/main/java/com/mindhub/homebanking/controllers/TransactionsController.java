package com.mindhub.homebanking.controllers;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mindhub.homebanking.dtos.TransactionDTO;
import com.mindhub.homebanking.models.Account;
import com.mindhub.homebanking.models.Client;
import com.mindhub.homebanking.models.Transaction;
import com.mindhub.homebanking.repositories.AccountRepository;
import com.mindhub.homebanking.repositories.ClientRepository;
import com.mindhub.homebanking.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.time.*;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

import static com.mindhub.homebanking.models.TransactionType.CREDIT;
import static com.mindhub.homebanking.models.TransactionType.DEBIT;


@RestController
@RequestMapping("/api")
public class TransactionsController {
    @Autowired
    ClientRepository clientRepository;
    @Autowired
    AccountRepository accountRepository;
    @Autowired
    TransactionRepository transactionRepository;

    @PostMapping("/clients/current/transactions")
    public Set<TransactionDTO> getTransactions(Authentication authentication,
                                               @RequestParam String fromDate,
                                               @RequestParam String thruDate,
                                               @RequestParam Long accountId) {
        Client client = clientRepository.findByEmail(authentication.getName());
        if (client != null) {
            Instant fromInstant = Instant.parse(fromDate);
            Instant thruInstant = Instant.parse(thruDate);
            LocalDateTime fromFormattedDate = LocalDateTime.ofInstant(fromInstant, ZoneId.of(ZoneOffset.UTC.getId()));
            LocalDateTime thruFormattedDate = LocalDateTime.ofInstant(thruInstant, ZoneId.of(ZoneOffset.UTC.getId()));
            Set<Transaction> transactionsBetweenDates = transactionRepository.findByDateGreaterThanAndDateLessThan(fromFormattedDate, thruFormattedDate);
            Set<Transaction> transactionsFilteredByAccount = transactionsBetweenDates.stream().filter(transaction -> transaction.getAccount() == accountRepository.findById(accountId).orElse(null)).collect(Collectors.toSet());
            return transactionsFilteredByAccount.stream().map(TransactionDTO::new).collect(Collectors.toSet());
        } else {
            return null;
        }

    }

    @Transactional
    @PostMapping("/transactions")
    public ResponseEntity<Object> transfer(Authentication authentication,
                                                @RequestParam Double amount,
                                                @RequestParam String description,
                                                @RequestParam String sourceAccountNumber,
                                                @RequestParam String destinationAccountNumber) {

        Client client = clientRepository.findByEmail(authentication.getName());

        if (client != null) {
            Set<Account> clientAccounts = client.getAccounts();

           if (description.isEmpty()) {
                return new ResponseEntity<>("Missing description", HttpStatus.FORBIDDEN);
            } else if (sourceAccountNumber.isEmpty()) {
                return new ResponseEntity<>("Missing source account number", HttpStatus.FORBIDDEN);
            } else if (destinationAccountNumber.isEmpty()) {
                return new ResponseEntity<>("Missing destination account number", HttpStatus.FORBIDDEN);
            }

            if (amount < 1) {
                return new ResponseEntity<>("Transfer values lower than 1 are not allowed.", HttpStatus.FORBIDDEN);
            } else if (accountRepository.findByNumber(sourceAccountNumber) == null) {
                return new ResponseEntity<>("Source account doesn't exist", HttpStatus.FORBIDDEN);
            } else if (accountRepository.findByNumber(destinationAccountNumber) == null) {
                return new ResponseEntity<>("Destination account doesn't exist", HttpStatus.FORBIDDEN);
            } else if (sourceAccountNumber.equals(destinationAccountNumber)) {
                return new ResponseEntity<>("Source and destination accounts are the same.", HttpStatus.FORBIDDEN);
            } else if (!clientAccounts.contains(accountRepository.findByNumber(sourceAccountNumber))) {
                return new ResponseEntity<>("Source account doesn't belong to current client.", HttpStatus.FORBIDDEN);
            } else if (amount > accountRepository.findByNumber(sourceAccountNumber).getBalance()) {
                return new ResponseEntity<>("Insufficient funds.", HttpStatus.FORBIDDEN);
            }

            Transaction transaction1 = new Transaction(DEBIT, -amount, description + " " + destinationAccountNumber, LocalDateTime.now());
            Transaction transaction2 = new Transaction(CREDIT, amount, description + " " + sourceAccountNumber, LocalDateTime.now());
            Account sourceAccount = accountRepository.findByNumber(sourceAccountNumber);
            Account destinationAccount = accountRepository.findByNumber(destinationAccountNumber);

            sourceAccount.addTransaction(transaction1);
            destinationAccount.addTransaction(transaction2);
            sourceAccount.setBalance(sourceAccount.getBalance() - amount);
            destinationAccount.setBalance(destinationAccount.getBalance() + amount);

            transactionRepository.save(transaction1);
            transactionRepository.save(transaction2);
            accountRepository.save(sourceAccount);
            accountRepository.save(destinationAccount);

            return new ResponseEntity<>("Transfer OK.", HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("Operation not allowed for unauthenticated users", HttpStatus.FORBIDDEN);
        }

    }
}
