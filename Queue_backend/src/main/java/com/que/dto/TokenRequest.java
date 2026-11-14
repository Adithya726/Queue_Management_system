package com.que.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TokenRequest {

    @NotBlank(message = "Person name is required")
    @Size(max = 100, message = "Person name must be at most 100 characters")
    private String personName;
}
