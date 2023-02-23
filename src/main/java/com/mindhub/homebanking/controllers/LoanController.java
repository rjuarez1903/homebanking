package com.mindhub.homebanking.controllers;

import com.mindhub.homebanking.dtos.LoanApplicationDTO;
import com.mindhub.homebanking.dtos.LoanDTO;
import com.mindhub.homebanking.models.*;
import com.mindhub.homebanking.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
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
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private ClientLoanRepository clientLoanRepository;

    @GetMapping("/loans")
    public List<LoanDTO> getLoans() {
        return loanRepository.findAll().stream().map(LoanDTO::new).collect(toList());
    }

    @Transactional
    @PostMapping("/loans")
    public ResponseEntity<Object> applyForLoan(Authentication authentication, @RequestBody LoanApplicationDTO loanApplicationDTO) {
        Client client = clientRepository.findByEmail(authentication.getName());
        if (client != null) {

            if (loanApplicationDTO.getId() == null) {
                return new ResponseEntity<>("Empty loan field.", HttpStatus.BAD_REQUEST);
            } else if (loanApplicationDTO.getAmount() == null) {
                return new ResponseEntity<>("Empty amount field.", HttpStatus.BAD_REQUEST);
            } else if (loanApplicationDTO.getPayments() == null) {
                return new ResponseEntity<>("Empty payments field.", HttpStatus.BAD_REQUEST);
            } else if ((loanApplicationDTO.getDestinationAccountNumber().isEmpty())) {
                return new ResponseEntity<>("Empty destination account field.", HttpStatus.BAD_REQUEST);
            }

            Loan requestedLoan = loanRepository.findById(loanApplicationDTO.getId()).orElse(null);

            if (requestedLoan == null) {
                return new ResponseEntity<>("Loan id doesn't exist.", HttpStatus.BAD_REQUEST);
            } else if (loanApplicationDTO.getAmount() < 1.0) {
                return new ResponseEntity<>("Loan amount can't be lower than 0", HttpStatus.BAD_REQUEST);
            }

            List<Integer> payments = loanRepository.findById(loanApplicationDTO.getId()).get().getPayments();
            Double maxAmount = loanRepository.findById(loanApplicationDTO.getId()).get().getMaxAmount();

            if (payments.stream().noneMatch(payment -> loanApplicationDTO.getPayments().equals(payment))) {
                return new ResponseEntity<>("Invalid payments value.", HttpStatus.BAD_REQUEST);
            } else if (loanApplicationDTO.getAmount() > maxAmount) {
                return new ResponseEntity<>("Loan max amount exceeded.", HttpStatus.BAD_REQUEST);
            } else if (accountRepository.findByNumber(loanApplicationDTO.getDestinationAccountNumber()) == null) {
                return new ResponseEntity<>("Destination account doesn't exist", HttpStatus.BAD_REQUEST);
            }

            Account destinationAccount = accountRepository.findByNumber(loanApplicationDTO.getDestinationAccountNumber());
            if (client.getAccounts().stream().noneMatch(account -> account == destinationAccount)) {
                return new ResponseEntity<>("Account doesn't belong to client.", HttpStatus.FORBIDDEN);
            }

            double interest = loanApplicationDTO.getAmount() * 0.20;
            ClientLoan clientLoan = new ClientLoan(loanApplicationDTO.getAmount() + interest, loanApplicationDTO.getPayments());
            Loan loan = loanRepository.findById(loanApplicationDTO.getId()).orElse(null);
            loan.addClientLoan(clientLoan);
            client.addClientLoan(clientLoan);
            Transaction transaction = new Transaction(TransactionType.CREDIT, clientLoan.getAmount(), requestedLoan.getName() + " loan approved", LocalDateTime.now());
            destinationAccount.addTransaction(transaction);
            destinationAccount.setBalance(destinationAccount.getBalance() + loanApplicationDTO.getAmount());
            transactionRepository.save(transaction);
            clientLoanRepository.save(clientLoan);
            return new ResponseEntity<>("Loan approved.", HttpStatus.CREATED);

        } else {

            return new ResponseEntity<>(HttpStatus.FORBIDDEN);

        }

    }
}
