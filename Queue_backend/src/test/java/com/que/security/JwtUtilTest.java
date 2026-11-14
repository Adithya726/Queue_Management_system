package com.que.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class JwtUtilTest {

    private static final String SECRET = "a-test-secret-that-is-at-least-32-bytes-long";

    @Test
    void tokenRoundTrip() {
        JwtUtil jwt = new JwtUtil(SECRET, 60_000);
        String token = jwt.generateToken("a@x.com");

        assertThat(jwt.validateToken(token)).isTrue();
        assertThat(jwt.extractEmail(token)).isEqualTo("a@x.com");
    }

    @Test
    void tokenSignedWithAnotherSecret_isRejected() {
        String forged = new JwtUtil("some-other-secret-that-is-also-32-bytes-plus", 60_000)
                .generateToken("victim@x.com");

        assertThat(new JwtUtil(SECRET, 60_000).validateToken(forged)).isFalse();
    }

    @Test
    void withoutASecret_eachRunGetsItsOwnRandomKey() {
        JwtUtil first = new JwtUtil("", 60_000);
        JwtUtil second = new JwtUtil("", 60_000);
        String token = first.generateToken("a@x.com");

        assertThat(first.validateToken(token)).isTrue();
        assertThat(second.validateToken(token)).isFalse();
    }

    @Test
    void expiredToken_isRejected() {
        JwtUtil jwt = new JwtUtil(SECRET, -1_000);
        assertThat(jwt.validateToken(jwt.generateToken("a@x.com"))).isFalse();
    }

    @Test
    void garbage_isRejected() {
        assertThat(new JwtUtil(SECRET, 60_000).validateToken("not-a-jwt")).isFalse();
    }
}
