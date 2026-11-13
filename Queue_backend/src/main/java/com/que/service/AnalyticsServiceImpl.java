package com.que.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.que.dto.*;
import com.que.model.*;
import com.que.repository.TokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TokenRepository tokenRepository;
    private final QueueServiceImpl queueService;

    @Override
    public AnalyticsResponse getAnalytics(Long queueId) {

        List<Token> tokens = tokenRepository
                .findByQueueIdOrderByCreatedAtAsc(queueId);

        long served = 0;
        long cancelled = 0;
        double totalWait = 0;
        double maxWait = 0;
        double totalService = 0;
        long waitCount = 0;
        long serviceCount = 0;

        for (Token token : tokens) {

            if (token.getStatus() == TokenStatus.SERVED) {
                served++;
            }

            if (token.getStatus() == TokenStatus.CANCELLED) {
                cancelled++;
            }

            if (token.getServingStartedAt() != null
                    && token.getCreatedAt() != null) {

                double wait = Duration.between(
                        token.getCreatedAt(),
                        token.getServingStartedAt()).toSeconds() / 60.0;

                totalWait += wait;
                maxWait = Math.max(maxWait, wait);
                waitCount++;
            }

            if (token.getCompletedAt() != null
                    && token.getServingStartedAt() != null) {

                totalService += Duration.between(
                        token.getServingStartedAt(),
                        token.getCompletedAt()).toSeconds() / 60.0;

                serviceCount++;
            }
        }

        int waitingCount = (int) tokens.stream()
                .filter(t -> t.getStatus() == TokenStatus.WAITING)
                .count();

        List<TrendPoint> trend = new ArrayList<>();

        // Basic trend points grouped by token creation hour.
        // We'll improve this into a proper time-series calculation.

        for (Token token : tokens) {

            if (token.getCreatedAt() != null) {
                trend.add(new TrendPoint(
                        token.getCreatedAt().toString(),
                        waitingCount));
            }
        }

        return new AnalyticsResponse(
                waitingCount,
                (int) served,
                (int) cancelled,
                waitCount == 0 ? 0 : totalWait / waitCount,
                maxWait,
                serviceCount == 0 ? 0 : totalService / serviceCount,
                trend);
    }
}