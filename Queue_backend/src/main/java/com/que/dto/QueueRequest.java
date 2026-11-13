package com.que.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class QueueRequest {

    @NotBlank(message = "Queue name is required")
    private String name;
}