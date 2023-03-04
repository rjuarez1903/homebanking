package com.mindhub.homebanking.dtos;

public class LoanApplicationDTO {
    private Long id;
    private Double amount;
    private Integer payments;
    private String destinationAccountNumber;

    public LoanApplicationDTO(Long id, Double amount, Integer payments, String destinationAccountNumber) {
        this.id = id;
        this.amount = amount;
        this.payments = payments;
        this.destinationAccountNumber = destinationAccountNumber;
    }

    public Long getId() {
        return id;
    }

    public Double getAmount() {
        return amount;
    }

    public Integer getPayments() {
        return payments;
    }

    public String getDestinationAccountNumber() {
        return destinationAccountNumber;
    }
}
