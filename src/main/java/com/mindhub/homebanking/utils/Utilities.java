package com.mindhub.homebanking.utils;

import java.util.concurrent.ThreadLocalRandom;

public class Utilities {
    public static Integer getRandomNumber(int origin, int bound) {
        return ThreadLocalRandom.current().nextInt(origin, bound + 1);
    }

    public static Integer getCvvNumber() {
        return getRandomNumber(100, 998);
    }

    public static String getRandomCardNumbers() {
        StringBuilder number = new StringBuilder();
        for (byte i = 0; i < 4; i++) {
            number.append(getRandomNumber(1000, 9998));
        }
        return number.toString();
    }
}
