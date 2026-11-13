
package com.que.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.que.dto.*;
import com.que.exception.ResourceNotFoundException;
import com.que.model.*;
import com.que.repository.TokenRepository;
import com.que.repository.QueueRepository;
import com.que.repository.ManagerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TokenRepository tokenRepository;
    private final QueueRepository queueRepository;
    private final ManagerRepository managerRepository;

    @Override
    public AnalyticsResponse getAnalytics(Long queueId) {

        // Verify logged-in manager
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        Manager manager = managerRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Manager not found"));

        // Verify queue ownership
        queueRepository.findByIdAndManagerId(queueId, manager.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Queue not found"));

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

        // Calculate queue length trend
        record Event(LocalDateTime at, int delta) {}

        List<Event> events = new ArrayList<>();

        for (Token t : tokens) {

            if (t.getCreatedAt() != null) {
                events.add(new Event(t.getCreatedAt(), +1));
            }

            if (t.getServingStartedAt() != null) {
                events.add(new Event(t.getServingStartedAt(), -1));
            } else if (t.getCancelledAt() != null) {
                events.add(new Event(t.getCancelledAt(), -1));
            }
        }

        events.sort(Comparator.comparing(Event::at));

        List<TrendPoint> trend = new ArrayList<>();
        int running = 0;

        for (Event e : events) {
            running += e.delta();

            trend.add(new TrendPoint(
                    e.at().toString(),
                    running));
        }

        if (trend.size() > 50) {
            trend = new ArrayList<>(
                    trend.subList(trend.size() - 50, trend.size()));
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
