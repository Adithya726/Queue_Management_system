
package com.que.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.que.dto.TokenRequest;
import com.que.dto.TokenResponse;
import com.que.exception.BadRequestException;
import com.que.exception.ResourceNotFoundException;
import com.que.model.*;
import com.que.repository.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final TokenRepository tokenRepository;
    private final QueueRepository queueRepository;
    private final ManagerRepository managerRepository;

    private Manager getCurrentManager() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        return managerRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Manager not found"));
    }

    private Queue getOwnedQueue(Long queueId) {
        return queueRepository.findByIdAndManagerId(
                queueId, getCurrentManager().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Queue not found"));
    }

    private Token getOwnedToken(Long tokenId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Token not found"));

        getOwnedQueue(token.getQueue().getId());
        return token;
    }

    private TokenResponse convertToResponse(Token token) {
        return new TokenResponse(
                token.getId(),
                token.getTokenNumber(),
                token.getPersonName(),
                token.getStatus(),
                token.getPosition(),
                token.getCreatedAt(),
                token.getServingStartedAt(),
                token.getCompletedAt(),
                token.getCancelledAt());
    }

    @Override
    @Transactional
    public TokenResponse addToken(Long queueId, TokenRequest request) {
        Queue queue = getOwnedQueue(queueId);

        List<Token> waiting = tokenRepository
                .findByQueueIdAndStatusOrderByPositionAsc(
                        queueId, TokenStatus.WAITING);

        long nextNumber = tokenRepository.countByQueueId(queueId) + 1L;

        Token token = new Token();
        token.setTokenNumber((int) nextNumber);
        token.setPersonName(request.getPersonName().trim());
        token.setQueue(queue);
        token.setStatus(TokenStatus.WAITING);

        int nextPosition = waiting.isEmpty()
                ? 1
                : waiting.get(waiting.size() - 1).getPosition() + 1;

        token.setPosition(nextPosition);

        return convertToResponse(tokenRepository.save(token));
    }

    @Override
    public List<TokenResponse> getTokens(Long queueId) {
        getOwnedQueue(queueId);

        return tokenRepository
                .findByQueueIdAndStatusInOrderByPositionAsc(
                        queueId,
                        List.of(TokenStatus.WAITING, TokenStatus.SERVING))
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    @Transactional
    public TokenResponse moveToken(Long tokenId, String direction) {
        Token token = getOwnedToken(tokenId);

        if (token.getStatus() != TokenStatus.WAITING) {
            throw new BadRequestException(
                    "Only waiting tokens can be moved");
        }

        List<Token> tokens = tokenRepository
                .findByQueueIdAndStatusOrderByPositionAsc(
                        token.getQueue().getId(), TokenStatus.WAITING);

        int index = tokens.indexOf(token);
        int targetIndex;

        if ("UP".equalsIgnoreCase(direction)) {
            targetIndex = index - 1;
        } else if ("DOWN".equalsIgnoreCase(direction)) {
            targetIndex = index + 1;
        } else {
            throw new BadRequestException("Invalid direction");
        }

        if (targetIndex < 0 || targetIndex >= tokens.size()) {
            throw new BadRequestException(
                    "Cannot move token further");
        }

        Token other = tokens.get(targetIndex);

        int oldPosition = token.getPosition();
        token.setPosition(other.getPosition());
        other.setPosition(oldPosition);

        tokenRepository.save(token);
        tokenRepository.save(other);

        return convertToResponse(token);
    }

    @Override
    @Transactional
    public TokenResponse serveNext(Long queueId) {
        getOwnedQueue(queueId);

        if (tokenRepository.countByQueueIdAndStatus(
                queueId, TokenStatus.SERVING) > 0) {
            throw new BadRequestException(
                    "Complete the current token before serving the next one");
        }

        Token token = tokenRepository
                .findFirstByQueueIdAndStatusOrderByPositionAsc(
                        queueId, TokenStatus.WAITING)
                .orElseThrow(() ->
                        new BadRequestException("Queue is empty"));

        token.setStatus(TokenStatus.SERVING);
        token.setServingStartedAt(LocalDateTime.now());

        tokenRepository.save(token);
        return convertToResponse(token);
    }

    @Override
    @Transactional
    public TokenResponse completeToken(Long tokenId) {
        Token token = getOwnedToken(tokenId);

        if (token.getStatus() != TokenStatus.SERVING) {
            throw new BadRequestException(
                    "Token is not being served");
        }

        token.setStatus(TokenStatus.SERVED);
        token.setCompletedAt(LocalDateTime.now());

        tokenRepository.save(token);
        return convertToResponse(token);
    }

    @Override
    @Transactional
    public TokenResponse cancelToken(Long tokenId) {
        Token token = getOwnedToken(tokenId);

        if (token.getStatus() != TokenStatus.WAITING) {
            throw new BadRequestException(
                    "Only waiting tokens can be cancelled");
        }

        token.setStatus(TokenStatus.CANCELLED);
        token.setCancelledAt(LocalDateTime.now());

        List<Token> waiting = tokenRepository
                .findByQueueIdAndStatusOrderByPositionAsc(
                        token.getQueue().getId(), TokenStatus.WAITING);

        for (Token current : waiting) {
            if (current.getPosition() > token.getPosition()) {
                current.setPosition(current.getPosition() - 1);
            }
        }

        tokenRepository.save(token);
        tokenRepository.saveAll(waiting);

        return convertToResponse(token);
    }
}
