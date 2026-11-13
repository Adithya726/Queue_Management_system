package com.que.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import com.que.dto.*;
import com.que.service.TokenService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TokenController {

    private final TokenService tokenService;

    @PostMapping("/queues/{queueId}/tokens")
    public ResponseEntity<TokenResponse> addToken(
            @PathVariable Long queueId,
            @Valid @RequestBody TokenRequest request) {

        return ResponseEntity.ok(
                tokenService.addToken(queueId, request));
    }

    @GetMapping("/queues/{queueId}/tokens")
    public ResponseEntity<List<TokenResponse>> getTokens(
            @PathVariable Long queueId) {

        return ResponseEntity.ok(
                tokenService.getTokens(queueId));
    }

    @PatchMapping("/tokens/{tokenId}/move")
    public ResponseEntity<TokenResponse> moveToken(
            @PathVariable Long tokenId,
            @RequestParam String direction) {

        return ResponseEntity.ok(
                tokenService.moveToken(tokenId, direction));
    }

    @PostMapping("/queues/{queueId}/serve-next")
    public ResponseEntity<TokenResponse> serveNext(
            @PathVariable Long queueId) {

        return ResponseEntity.ok(
                tokenService.serveNext(queueId));
    }

    @PostMapping("/tokens/{tokenId}/complete")
    public ResponseEntity<TokenResponse> completeToken(
            @PathVariable Long tokenId) {

        return ResponseEntity.ok(
                tokenService.completeToken(tokenId));
    }

    @PatchMapping("/tokens/{tokenId}/cancel")
    public ResponseEntity<TokenResponse> cancelToken(
            @PathVariable Long tokenId) {

        return ResponseEntity.ok(
                tokenService.cancelToken(tokenId));
    }
}