package com.mindhub.homebanking.dtos;

public class LoanApplicationDTO {
    private long id;
    private double amount;
    private Integer payments;
    private String destinationAccountNumber;

    public LoanApplicationDTO(long id, double amount, Integer payments, String destinationAccountNumber) {
        this.id = id;
        this.amount = amount;
        this.payments = payments;
        this.destinationAccountNumber = destinationAccountNumber;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setPayments(Integer payments) {
        this.payments = payments;
    }

    public void setDestinationAccountNumber(String destinationAccountNumber) {
        this.destinationAccountNumber = destinationAccountNumber;
    }

}
