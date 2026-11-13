package com.que.service;

import com.que.dto.LoginRequest;
import com.que.dto.RegisterRequest;
import com.que.dto.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}