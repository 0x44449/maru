package com.maru.api.domain.user;

import java.security.SecureRandom;

public class UserUtil {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String[] ADJECTIVES = {
            "졸린", "용감한", "수줍은", "배고픈", "느긋한", "씩씩한", "호기심많은", "엉뚱한",
            "반짝이는", "조용한", "활발한", "귀여운", "당당한", "명랑한", "겁없는"
    };
    private static final String[] NOUNS = {
            "고양이", "두부", "판다", "수달", "토끼", "구름", "별사탕", "감자",
            "호랑이", "펭귄", "다람쥐", "햄스터", "고래", "너구리", "해파리"
    };

    public static String generateUserTag(String prefix, int length) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        var sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        }

        return prefix + sb.toString();
    }

    public static String generateNickname() {
        String adj = ADJECTIVES[RANDOM.nextInt(ADJECTIVES.length)];
        String noun = NOUNS[RANDOM.nextInt(NOUNS.length)];
        int num = RANDOM.nextInt(999) + 1;
        return adj + " " + noun + " " + num;
    }
}
