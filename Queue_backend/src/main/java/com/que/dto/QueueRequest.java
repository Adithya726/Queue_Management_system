package com.que.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QueueRequest {

    @NotBlank(message = "Queue name is required")
    @Size(max = 100, message = "Queue name must be at most 100 characters")
    private String name;
}
