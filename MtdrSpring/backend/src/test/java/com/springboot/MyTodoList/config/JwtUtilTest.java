package com.springboot.MyTodoList.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private static final String SECRET = "test_secret_key_minimum_32_characters_long_hmac";
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, 86400000L);
    }

    @Test
    void generateAndValidate_roundtrip() {
        String token = jwtUtil.generateToken(42L);

        assertThat(jwtUtil.validateToken(token)).isTrue();
        assertThat(jwtUtil.extractUserId(token)).isEqualTo("42");
    }

    @Test
    void validateToken_withTamperedToken_returnsFalse() {
        String token = jwtUtil.generateToken(1L);
        String tampered = token.substring(0, token.length() - 4) + "XXXX";

        assertThat(jwtUtil.validateToken(tampered)).isFalse();
    }

    @Test
    void validateToken_withExpiredToken_returnsFalse() {
        JwtUtil expiringJwt = new JwtUtil(SECRET, -1L);
        String token = expiringJwt.generateToken(1L);

        assertThat(jwtUtil.validateToken(token)).isFalse();
    }
}
