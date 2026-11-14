package com.que.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

/** One queue's live status, as the dashboard shows it. */
@Data
@AllArgsConstructor
public class QueueOverviewResponse {

    private Long id;
    private String name;
    private LocalDateTime createdAt;

    private Integer waitingCount;
    private TokenResponse serving;
    private TokenResponse next;

    private Integer servedCount;
    private Integer cancelledCount;

    private Double averageWaitTime;
    private Integer waitSampleCount;

    private Double averageServiceTime;
}
