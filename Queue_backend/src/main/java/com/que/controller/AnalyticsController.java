package com.que.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import com.que.dto.AnalyticsResponse;
import com.que.service.AnalyticsService;

@RestController
@RequestMapping("/api/queues")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{queueId}/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable Long queueId) {

        return ResponseEntity.ok(
                analyticsService.getAnalytics(queueId));
    }
}