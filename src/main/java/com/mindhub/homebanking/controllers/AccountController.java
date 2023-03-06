package com.mindhub.homebanking.controllers;

import com.mindhub.homebanking.dtos.AccountDTO;
import com.mindhub.homebanking.models.Account;
import com.mindhub.homebanking.models.AccountType;
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
import java.util.Set;
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
    public ResponseEntity<Object> createAccount(Authentication authentication, @RequestParam AccountType type) {
        Client client = clientRepository.findByEmail(authentication.getName());

        if (client != null) {
            if (client.getAccounts().size() < 3 ) {
                String accountName;
                do {
                    accountName = AccountUtilities.getRandomAccountNumber();
                } while (accountRepository.findByNumber(accountName) != null);
                Account account = new Account(accountName, LocalDateTime.now(), 0, type);
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

    @PatchMapping("/clients/current/accounts/{id}")
    public ResponseEntity<Object> deleteAccount(Authentication authentication, @PathVariable Long id) {
        Client client = clientRepository.findByEmail(authentication.getName());

        if (client != null) {
            Set<Account> activeClientAccounts = client.getAccounts().stream().filter(account -> account.isActive()).collect(Collectors.toSet());
            Set<Account> inactiveClientAccounts = client.getAccounts().stream().filter(account -> !account.isActive()).collect(Collectors.toSet());
            Account selectedAccount = accountRepository.findById(id).orElse(null);

            if (selectedAccount != null) {
                if (activeClientAccounts.contains(selectedAccount)) {
                    selectedAccount.setActive(false);
                    accountRepository.save(selectedAccount);
                    return new ResponseEntity<>("Account disabled", HttpStatus.OK);
                } else if (inactiveClientAccounts.contains(selectedAccount)){
                    return new ResponseEntity<>("Account is already inactive", HttpStatus.BAD_REQUEST);
                } else {
                    return new ResponseEntity<>("Account doesn't belong to client", HttpStatus.FORBIDDEN);
                }
            } else {
                return new ResponseEntity<>("Account not found", HttpStatus.BAD_REQUEST);
            }

        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }
}