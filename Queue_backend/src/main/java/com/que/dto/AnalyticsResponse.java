package com.que.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class AnalyticsResponse {

    private Integer currentQueueLength;
    private Integer totalServed;
    private Integer totalCancelled;

    private Double averageWaitTime;
    private Double maxWaitTime;
    private Double averageServiceTime;

    private List<TrendPoint> queueLengthTrend;
}