package com.que.service;

import com.que.dto.AnalyticsResponse;

public interface AnalyticsService {

    AnalyticsResponse getAnalytics(Long queueId);
}