package com.que.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import com.que.dto.TrendPoint;
import com.que.model.Token;

/** Pure calculations over a queue's tokens, kept separate so they are easy to test. */
final class AnalyticsMath {

    private AnalyticsMath() {
    }

    static double minutesBetween(LocalDateTime from, LocalDateTime to) {
        return Duration.between(from, to).toSeconds() / 60.0;
    }

    /** Wait = joined to called. Null for tokens that were never called. */
    static Double waitMinutes(Token token) {
        if (token.getCreatedAt() == null || token.getServingStartedAt() == null) {
            return null;
        }
        return minutesBetween(token.getCreatedAt(), token.getServingStartedAt());
    }

    /**
     * Replays every join (+1) and every leave (-1) in time order. A token
     * leaves the waiting line when it is called to the counter or cancelled,
     * so the series counts people waiting, not people at the counter.
     */
    static List<TrendPoint> queueLengthTrend(List<Token> tokens) {
        record Event(LocalDateTime at, int delta) {
        }

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

        // Joins sort before leaves at the same instant so the count never dips below zero.
        events.sort(Comparator.comparing(Event::at)
                .thenComparing(Event::delta, Comparator.reverseOrder()));

        List<TrendPoint> trend = new ArrayList<>(events.size());
        int running = 0;
        for (Event e : events) {
            running += e.delta();
            trend.add(new TrendPoint(e.at().toString(), running));
        }
        return trend;
    }

    static int peak(List<TrendPoint> trend) {
        return trend.stream().mapToInt(TrendPoint::getQueueLength).max().orElse(0);
    }
}
