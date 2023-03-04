package com.mindhub.homebanking.utils;

import java.util.concurrent.ThreadLocalRandom;

public class Utilities {
    public static Integer getRandomNumber(int origin, int bound) {
        return ThreadLocalRandom.current().nextInt(origin, bound + 1);
    }

}
