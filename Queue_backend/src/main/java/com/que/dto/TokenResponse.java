package com.que.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import com.que.model.TokenStatus;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TokenResponse {

    private Long id;
    private Integer tokenNumber;
    private String personName;
    private TokenStatus status;
    private Integer position;
    private LocalDateTime createdAt;
    private LocalDateTime servingStartedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
}