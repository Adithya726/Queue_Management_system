package com.que.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnalyticsResponse {

    private Integer currentQueueLength;
    private Integer totalServed;
    private Integer totalCancelled;

    /** Minutes from joining to being called, averaged over called tokens. */
    private Double averageWaitTime;
    private Double maxWaitTime;
    /** Minutes at the counter, averaged over completed tokens. */
    private Double averageServiceTime;

    /** How many tokens the average wait is based on (for weighted averages). */
    private Integer waitSampleCount;

    /** Highest number of people waiting at once, over the queue's whole history. */
    private Integer peakQueueLength;

    /** Queue length after each join or leave, oldest first. */
    private List<TrendPoint> queueLengthTrend;
}
