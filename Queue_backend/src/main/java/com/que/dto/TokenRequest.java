package com.que.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class TokenRequest {

    @NotBlank(message = "Person name is required")
    private String personName;
}