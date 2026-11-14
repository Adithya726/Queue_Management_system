package com.que.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.que.dto.TrendPoint;
import com.que.model.Token;
import com.que.model.TokenStatus;

class AnalyticsMathTest {

    private static final LocalDateTime T0 = LocalDateTime.of(2026, 11, 14, 10, 0);

    private static Token token(int joinMin, Integer calledMin, Integer cancelledMin) {
        Token t = new Token();
        t.setCreatedAt(T0.plusMinutes(joinMin));
        if (calledMin != null) {
            t.setServingStartedAt(T0.plusMinutes(calledMin));
            t.setStatus(TokenStatus.SERVING);
        } else if (cancelledMin != null) {
            t.setCancelledAt(T0.plusMinutes(cancelledMin));
            t.setStatus(TokenStatus.CANCELLED);
        } else {
            t.setStatus(TokenStatus.WAITING);
        }
        return t;
    }

    @Test
    void waitMinutes_isJoinToCalled() {
        assertThat(AnalyticsMath.waitMinutes(token(0, 7, null))).isEqualTo(7.0);
        assertThat(AnalyticsMath.waitMinutes(token(0, null, null))).isNull();
    }

    @Test
    void trend_replaysJoinsAndLeavesInOrder() {
        List<Token> tokens = List.of(
                token(0, 5, null),   // joins 0, called 5
                token(1, null, 3),   // joins 1, cancels 3
                token(2, null, null) // joins 2, still waiting
        );

        List<TrendPoint> trend = AnalyticsMath.queueLengthTrend(tokens);

        assertThat(trend).extracting(TrendPoint::getQueueLength)
                .containsExactly(1, 2, 3, 2, 1);
        assertThat(AnalyticsMath.peak(trend)).isEqualTo(3);
    }

    @Test
    void trend_keepsEveryEvent_soThePeakIsNeverCutOff() {
        List<Token> tokens = new java.util.ArrayList<>();
        for (int i = 0; i < 40; i++) {
            tokens.add(token(i, null, null)); // 40 people pile up
        }
        for (int i = 0; i < 40; i++) {
            tokens.get(i).setServingStartedAt(T0.plusMinutes(100 + i)); // then all get served
        }

        List<TrendPoint> trend = AnalyticsMath.queueLengthTrend(tokens);

        assertThat(trend).hasSize(80);
        assertThat(AnalyticsMath.peak(trend)).isEqualTo(40);
        assertThat(trend.get(trend.size() - 1).getQueueLength()).isZero();
    }

    @Test
    void trend_joinBeforeLeaveAtTheSameInstant() {
        Token a = token(0, 5, null);
        Token b = token(5, null, null);

        List<TrendPoint> trend = AnalyticsMath.queueLengthTrend(List.of(a, b));

        assertThat(trend).extracting(TrendPoint::getQueueLength).containsExactly(1, 2, 1);
    }
}
