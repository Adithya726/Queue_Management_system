
package com.que.service;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.que.dto.*;
import com.que.exception.BadRequestException;
import com.que.model.Manager;
import com.que.repository.ManagerRepository;
import com.que.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final ManagerRepository managerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /** Emails are stored trimmed and lowercase so "A@x.com" and "a@x.com" are one account. */
    static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = normalizeEmail(request.getEmail());

        if (managerRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }

        Manager manager = new Manager();
        manager.setName(request.getName().trim());
        manager.setEmail(email);
        manager.setPassword(
                passwordEncoder.encode(request.getPassword()));

        managerRepository.save(manager);

        String token = jwtUtil.generateToken(manager.getEmail());

        return new AuthResponse(
                token,
                manager.getId(),
                manager.getName(),
                manager.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        Manager manager = managerRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() ->
                        new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(), manager.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(manager.getEmail());

        return new AuthResponse(
                token,
                manager.getId(),
                manager.getName(),
                manager.getEmail());
    }
}
