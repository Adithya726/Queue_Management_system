package com.que.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import com.que.dto.*;
import com.que.service.QueueService;

@RestController
@RequestMapping("/api/queues")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;

    @PostMapping
    public ResponseEntity<QueueResponse> createQueue(
            @Valid @RequestBody QueueRequest request) {

        return ResponseEntity.ok(
                queueService.createQueue(request));
    }

    @GetMapping
    public ResponseEntity<List<QueueResponse>> getMyQueues() {

        return ResponseEntity.ok(
                queueService.getMyQueues());
    }
}