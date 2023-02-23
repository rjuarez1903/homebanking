package com.mindhub.homebanking.controllers;

import com.mindhub.homebanking.dtos.LoanApplicationDTO;
import com.mindhub.homebanking.dtos.LoanDTO;
import com.mindhub.homebanking.models.Client;
import com.mindhub.homebanking.repositories.AccountRepository;
import com.mindhub.homebanking.repositories.ClientRepository;
import com.mindhub.homebanking.repositories.LoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

import static java.util.stream.Collectors.toList;

@RestController
@RequestMapping("/api")
public class LoanController {

    @Autowired
    ClientRepository clientRepository;
    @Autowired
    LoanRepository loanRepository;
    @Autowired
    AccountRepository accountRepository;

    @GetMapping("/loans")
    public List<LoanDTO> getLoans() {
        return loanRepository.findAll().stream().map(LoanDTO::new).collect(toList());
    }

    @Transactional
    @PostMapping("/loans")
    public ResponseEntity<Object> applyForLoan(Authentication authentication, @RequestBody LoanApplicationDTO loanApplicationDTO) {
        Client client = clientRepository.findByEmail(authentication.getName());
        if (client != null) {
            if (loanRepository.findById(loanApplicationDTO.getId()) == null) {
                return new ResponseEntity<>("Loan id doesn't exist", HttpStatus.BAD_REQUEST);
            } else if (loanApplicationDTO.getAmount() < 1.0) {
                return new ResponseEntity<>("Loan amount can't be lower than 0", HttpStatus.BAD_REQUEST);
            } else if (loanApplicationDTO.getPayments() < 1) {
                return new ResponseEntity<>("Invalid payment value", HttpStatus.BAD_REQUEST);
            } else if (accountRepository.findByNumber(loanApplicationDTO.getDestinationAccountNumber()) == null) {
                return new ResponseEntity<>("Destination account doesn't exist", HttpStatus.BAD_REQUEST);
            }

            return new ResponseEntity<>("Loan approved.", HttpStatus.CREATED);

        } else {

            return new ResponseEntity<>(HttpStatus.FORBIDDEN);

        }

    }
}
