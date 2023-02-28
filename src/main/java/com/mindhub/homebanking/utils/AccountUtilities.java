package com.mindhub.homebanking.utils;

public class AccountUtilities {

    public static String getRandomAccountNumber() {
        String accountPrefix = "VIN";
        int accountNumber = Utilities.getRandomNumber(0, 99999999);
        return accountPrefix + accountNumber;
    }
}