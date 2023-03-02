package com.mindhub.homebanking.utils;

public class CardUtilities {
    public static Integer getCvvNumber() {
        return Utilities.getRandomNumber(100, 999);
    }

    public static String getRandomCardNumbers() {
        StringBuilder number = new StringBuilder();
        for (byte i = 0; i < 4; i++) {
            number.append(Utilities.getRandomNumber(1000, 9999));
        }
        return number.toString();
    }
}
