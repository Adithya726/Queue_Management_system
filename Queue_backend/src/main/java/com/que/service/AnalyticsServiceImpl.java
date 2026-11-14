package com.que.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.que.dto.AnalyticsResponse;
import com.que.dto.TrendPoint;
import com.que.exception.ResourceNotFoundException;
import com.que.model.Token;
import com.que.repository.QueueRepository;
import com.que.repository.TokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TokenRepository tokenRepository;
    private final QueueRepository queueRepository;
    private final CurrentManagerProvider currentManager;

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(Long queueId) {

        queueRepository.findByIdAndManagerId(queueId, currentManager.get().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Queue not found"));

        List<Token> tokens = tokenRepository
                .findByQueueIdOrderByCreatedAtAsc(queueId);

        int waiting = 0;
        int served = 0;
        int cancelled = 0;
        double totalWait = 0;
        double maxWait = 0;
        int waitCount = 0;
        double totalService = 0;
        int serviceCount = 0;

        for (Token token : tokens) {
            switch (token.getStatus()) {
                case WAITING -> waiting++;
                case SERVED -> served++;
                case CANCELLED -> cancelled++;
                default -> {
                }
            }

            Double wait = AnalyticsMath.waitMinutes(token);
            if (wait != null) {
                totalWait += wait;
                maxWait = Math.max(maxWait, wait);
                waitCount++;
            }

            Double service = AnalyticsMath.serviceMinutes(token);
            if (service != null) {
                totalService += service;
                serviceCount++;
            }
        }

        List<TrendPoint> trend = AnalyticsMath.queueLengthTrend(tokens);

        return new AnalyticsResponse(
                waiting,
                served,
                cancelled,
                waitCount == 0 ? 0 : totalWait / waitCount,
                maxWait,
                serviceCount == 0 ? 0 : totalService / serviceCount,
                waitCount,
                AnalyticsMath.peak(trend),
                trend);
    }
}
