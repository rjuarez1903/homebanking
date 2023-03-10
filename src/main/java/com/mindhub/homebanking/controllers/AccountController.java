package com.mindhub.homebanking.controllers;

import com.mindhub.homebanking.dtos.AccountDTO;
import com.mindhub.homebanking.models.Account;
import com.mindhub.homebanking.models.Client;
import com.mindhub.homebanking.repositories.AccountRepository;
import com.mindhub.homebanking.repositories.ClientRepository;
import com.mindhub.homebanking.utils.AccountUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

@RestController
@RequestMapping("/api")
public class AccountController {

    @Autowired
    AccountRepository accountRepository;
    @Autowired
    ClientRepository clientRepository;

    @GetMapping("/accounts")
    public List<AccountDTO> getAccounts() {
        return accountRepository.findAll().stream().map(AccountDTO::new).collect(toList());
    }

    @GetMapping("/accounts/{id}")
    public AccountDTO getAccount(@PathVariable Long id) {
        return accountRepository.findById(id).map(AccountDTO::new).orElse(null);
    }

    @GetMapping("/clients/current/accounts")
    public List<AccountDTO> getCurrentAccounts(Authentication authentication) {
        return clientRepository.findByEmail(authentication.getName()).getAccounts().stream().map(AccountDTO::new).collect(Collectors.toList());
    }

    @PostMapping("/clients/current/accounts")
    public ResponseEntity<Object> createAccount(Authentication authentication) {
        Client client = clientRepository.findByEmail(authentication.getName());

        if (client != null) {
            if (client.getAccounts().size() < 3 ) {
                String accountName;
                do {
                    accountName = AccountUtilities.getRandomAccountNumber();
                } while (accountRepository.findByNumber(accountName) != null);
                Account account = new Account(accountName, LocalDateTime.now(), 0);
                client.addAccount(account);
                accountRepository.save(account);
                return new ResponseEntity<>(HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>("Can't generate more than 3 accounts per client.", HttpStatus.FORBIDDEN);
            }
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

    }
}