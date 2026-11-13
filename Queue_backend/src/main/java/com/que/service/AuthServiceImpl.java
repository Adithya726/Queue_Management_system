
package com.que.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (managerRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        Manager manager = new Manager();
        manager.setName(request.getName());
        manager.setEmail(request.getEmail());
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
    public AuthResponse login(LoginRequest request) {

        Manager manager = managerRepository.findByEmail(request.getEmail())
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
