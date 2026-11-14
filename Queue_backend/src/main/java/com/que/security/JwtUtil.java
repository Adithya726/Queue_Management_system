package com.que.security;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Date;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);
    private static final int MIN_SECRET_BYTES = 32; // HS256 needs a 256-bit key

    private final SecretKey signingKey;
    private final long expiration;

    public JwtUtil(
            @Value("${jwt.secret:}") String secret,
            @Value("${jwt.expiration-ms}") long expiration) {

        this.expiration = expiration;
        this.signingKey = new SecretKeySpec(resolveSecret(secret), "HmacSHA256");
    }

    /**
     * Uses JWT_SECRET when it is set and long enough. Otherwise generates a
     * random key for this run, so there is never a known default secret that
     * could be used to forge tokens. The trade-off: without JWT_SECRET, users
     * must log in again after a restart.
     */
    private static byte[] resolveSecret(String secret) {
        if (secret != null && secret.getBytes(StandardCharsets.UTF_8).length >= MIN_SECRET_BYTES) {
            return secret.getBytes(StandardCharsets.UTF_8);
        }

        if (secret != null && !secret.isBlank()) {
            log.warn("JWT_SECRET is shorter than {} bytes and was ignored.", MIN_SECRET_BYTES);
        }
        log.warn("JWT_SECRET is not set. Using a random secret for this run; "
                + "logins will not survive a restart.");

        byte[] random = new byte[64];
        new SecureRandom().nextBytes(random);
        return random;
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(signingKey)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
