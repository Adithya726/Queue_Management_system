package com.que.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class QueueResponse {

    private Long id;
    private String name;
    private LocalDateTime createdAt;
}