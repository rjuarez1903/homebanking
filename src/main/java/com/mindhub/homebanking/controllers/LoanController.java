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
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

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

            Long requestedLoanId = loanApplicationDTO.getId();
            Double requestedLoanAmount = loanApplicationDTO.getAmount();
            Integer requestedLoanPayments = loanApplicationDTO.getPayments();
            String requestedLoanDestinationAccountNumber = loanApplicationDTO.getDestinationAccountNumber();
            Set<Account> clientAccounts = client.getAccounts();
            List<Integer> payments = new ArrayList<>();
            Double maxAmount = 0.0;

            if (requestedLoanId == null) {
                return new ResponseEntity<>("Empty loan field.", HttpStatus.BAD_REQUEST);
            } else if (requestedLoanAmount == null) {
                return new ResponseEntity<>("Empty amount field.", HttpStatus.BAD_REQUEST);
            } else if (requestedLoanPayments == null) {
                return new ResponseEntity<>("Empty payments field.", HttpStatus.BAD_REQUEST);
            } else if (requestedLoanDestinationAccountNumber.isEmpty()) {
                return new ResponseEntity<>("Empty destination account field.", HttpStatus.BAD_REQUEST);
            }

            Loan requestedLoan = loanRepository.findById(requestedLoanId).orElse(null);

            Set<ClientLoan> clientLoans = client.getLoans();
            for (ClientLoan clientLoan : clientLoans) {
                if (clientLoan.getLoan() == requestedLoan) {
                    return new ResponseEntity<>("Can't apply for the same loan twice.", HttpStatus.FORBIDDEN);
                }
            }

            if (requestedLoan != null) {
                payments = requestedLoan.getPayments();
                maxAmount = requestedLoan.getMaxAmount();
            } else {
                return new ResponseEntity<>("Loan id doesn't exist.", HttpStatus.BAD_REQUEST);
            }

            if (requestedLoanAmount < 1.0) {
                return new ResponseEntity<>("Loan amount can't be lower than 0", HttpStatus.BAD_REQUEST);
            }

            if (!payments.contains(requestedLoanPayments)) {
                return new ResponseEntity<>("Invalid payments value.", HttpStatus.BAD_REQUEST);
            } else if (requestedLoanAmount > maxAmount) {
                return new ResponseEntity<>("Loan max amount exceeded.", HttpStatus.BAD_REQUEST);
            } else if (accountRepository.findByNumber(requestedLoanDestinationAccountNumber) == null) {
                return new ResponseEntity<>("Destination account doesn't exist", HttpStatus.BAD_REQUEST);
            }

            Account destinationAccount = accountRepository.findByNumber(requestedLoanDestinationAccountNumber);

            if (!clientAccounts.contains(destinationAccount)) {
                return new ResponseEntity<>("Account doesn't belong to client.", HttpStatus.FORBIDDEN);
            }

            double interest = requestedLoanAmount * 0.20;
            ClientLoan clientLoan = new ClientLoan(requestedLoanAmount + interest, requestedLoanPayments);
            Loan loan = loanRepository.findById(requestedLoanId).orElse(null);
            Transaction transaction = new Transaction(TransactionType.CREDIT, requestedLoanAmount, requestedLoan.getName() + " loan approved", LocalDateTime.now());
            loan.addClientLoan(clientLoan);
            client.addClientLoan(clientLoan);
            destinationAccount.addTransaction(transaction);
            destinationAccount.setBalance(destinationAccount.getBalance() + requestedLoanAmount);
            transactionRepository.save(transaction);
            clientLoanRepository.save(clientLoan);
            return new ResponseEntity<>("Loan approved.", HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

    }
}
