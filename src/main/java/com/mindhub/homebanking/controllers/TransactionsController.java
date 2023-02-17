package com.mindhub.homebanking.controllers;

import com.mindhub.homebanking.models.Account;
import com.mindhub.homebanking.models.Client;
import com.mindhub.homebanking.models.Transaction;
import com.mindhub.homebanking.repositories.AccountRepository;
import com.mindhub.homebanking.repositories.ClientRepository;
import com.mindhub.homebanking.repositories.TransactionRepository;a
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Set;

import static com.mindhub.homebanking.models.TransactionType.CREDIT;
import static com.mindhub.homebanking.models.TransactionType.DEBIT;


@RestController
@RequestMapping("api")
public class TransactionsController {
    @Autowired
    ClientRepository clientRepository;
    @Autowired
    AccountRepository accountRepository;
    @Autowired
    TransactionRepository transactionRepository;

    @Transactional
    @RequestMapping(path = "/transactions", method = RequestMethod.POST)
    public ResponseEntity<Object> createAccount(Authentication authentication,
                                                @RequestParam double amount,
                                                @RequestParam String description,
                                                @RequestParam String sourceAccountNumber,
                                                @RequestParam String destinationAccountNumber) {

        Client client = clientRepository.findByEmail(authentication.getName());
        Set<Account> clientAccounts = client.getAccounts();
        boolean sourceBelongsToClient = false;

        if (amount == 0.0 || description.isEmpty() || sourceAccountNumber.isEmpty() || destinationAccountNumber.isEmpty()) {
            return new ResponseEntity<>("Missing data", HttpStatus.FORBIDDEN);
        }

        if (accountRepository.findByNumber(sourceAccountNumber) == null) {
            return new ResponseEntity<>("Source account doesn't exist", HttpStatus.FORBIDDEN);
        }

        if (accountRepository.findByNumber(destinationAccountNumber) == null) {
            return new ResponseEntity<>("Destination account doesn't exist", HttpStatus.FORBIDDEN);
        }

        if (sourceAccountNumber.equals(destinationAccountNumber)) {
            return new ResponseEntity<>("Source and destination accounts are the same.", HttpStatus.FORBIDDEN);
        }

        for (Account account : clientAccounts) {
            if (account.getNumber().equals(sourceAccountNumber)) {
                sourceBelongsToClient = true;
                break;
            }
        }

        if (!sourceBelongsToClient) {
            return new ResponseEntity<>("Source account doesn't belong to current client.", HttpStatus.FORBIDDEN);
        }

        if (amount > accountRepository.findByNumber(sourceAccountNumber).getBalance()) {
            return new ResponseEntity<>("Insufficient funds.", HttpStatus.FORBIDDEN);
        }

        Transaction transaction1 = new Transaction(DEBIT, -amount, description + " " + sourceAccountNumber, LocalDateTime.now());
        Transaction transaction2 = new Transaction(CREDIT, amount, description + " " + destinationAccountNumber, LocalDateTime.now());
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
        return new ResponseEntity<>(HttpStatus.CREATED);

    }
}
