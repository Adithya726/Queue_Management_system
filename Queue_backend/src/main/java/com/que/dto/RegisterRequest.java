package com.que.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    @Size(max = 254, message = "Email is too long")
    private String email;

    // BCrypt only uses the first 72 bytes, so longer passwords are rejected.
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 72, message = "Password must be 6 to 72 characters")
    private String password;
}
