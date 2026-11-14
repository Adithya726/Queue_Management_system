package com.que.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.que.dto.AuthResponse;
import com.que.dto.LoginRequest;
import com.que.dto.RegisterRequest;
import com.que.exception.BadRequestException;
import com.que.model.Manager;
import com.que.repository.ManagerRepository;
import com.que.security.JwtUtil;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private ManagerRepository managerRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl service;

    @Test
    void register_storesEmailLowercaseAndHashesPassword() {
        RegisterRequest req = new RegisterRequest();
        req.setName(" Arun ");
        req.setEmail("  Arun@Example.COM ");
        req.setPassword("secret12");
        when(managerRepository.existsByEmail("arun@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret12")).thenReturn("hashed");
        when(managerRepository.save(any(Manager.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtil.generateToken("arun@example.com")).thenReturn("jwt");

        AuthResponse res = service.register(req);

        assertThat(res.getEmail()).isEqualTo("arun@example.com");
        assertThat(res.getName()).isEqualTo("Arun");
        assertThat(res.getToken()).isEqualTo("jwt");
        verify(managerRepository).save(org.mockito.ArgumentMatchers.argThat(m -> "hashed".equals(m.getPassword())));
    }

    @Test
    void register_duplicateEmail_isRejected() {
        RegisterRequest req = new RegisterRequest();
        req.setName("A");
        req.setEmail("A@x.com");
        req.setPassword("secret12");
        when(managerRepository.existsByEmail("a@x.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Email already registered");
        verify(managerRepository, never()).save(any());
    }

    @Test
    void login_wrongPasswordAndUnknownEmail_giveTheSameMessage() {
        Manager m = new Manager();
        m.setEmail("a@x.com");
        m.setPassword("hashed");
        when(managerRepository.findByEmail("a@x.com")).thenReturn(Optional.of(m));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);
        when(managerRepository.findByEmail("nobody@x.com")).thenReturn(Optional.empty());

        LoginRequest wrongPassword = new LoginRequest();
        wrongPassword.setEmail("A@X.com");
        wrongPassword.setPassword("wrong");
        LoginRequest unknown = new LoginRequest();
        unknown.setEmail("nobody@x.com");
        unknown.setPassword("whatever");

        assertThatThrownBy(() -> service.login(wrongPassword)).hasMessage("Invalid email or password");
        assertThatThrownBy(() -> service.login(unknown)).hasMessage("Invalid email or password");
    }
}
