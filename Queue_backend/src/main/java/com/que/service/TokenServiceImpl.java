package com.que.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.que.dto.TokenRequest;
import com.que.dto.TokenResponse;
import com.que.exception.BadRequestException;
import com.que.exception.ResourceNotFoundException;
import com.que.model.Queue;
import com.que.model.Token;
import com.que.model.TokenStatus;
import com.que.repository.QueueRepository;
import com.que.repository.TokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final TokenRepository tokenRepository;
    private final QueueRepository queueRepository;
    private final CurrentManagerProvider currentManager;

    /** Ownership check without a lock, for reads. */
    private Queue getOwnedQueue(Long queueId) {
        return queueRepository.findByIdAndManagerId(
                queueId, currentManager.get().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Queue not found"));
    }

    /** Ownership check that also locks the queue row until the transaction ends. */
    private Queue lockOwnedQueue(Long queueId) {
        return queueRepository.findOwnedForUpdate(
                queueId, currentManager.get().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Queue not found"));
    }

    /**
     * Locks the token's queue first, then loads the token, so the token is
     * read only after any concurrent change to the same queue has committed.
     */
    private Token lockOwnedToken(Long tokenId) {
        Long queueId = tokenRepository.findQueueIdByTokenId(tokenId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Token not found"));

        lockOwnedQueue(queueId);

        return tokenRepository.findById(tokenId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Token not found"));
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
        Queue queue = lockOwnedQueue(queueId);

        List<Token> waiting = tokenRepository
                .findByQueueIdAndStatusOrderByPositionAsc(
                        queueId, TokenStatus.WAITING);

        Token token = new Token();
        token.setTokenNumber(tokenRepository.findMaxTokenNumber(queueId) + 1);
        token.setPersonName(request.getPersonName().trim());
        token.setQueue(queue);
        token.setStatus(TokenStatus.WAITING);
        token.setPosition(waiting.isEmpty()
                ? 1
                : waiting.get(waiting.size() - 1).getPosition() + 1);

        return convertToResponse(tokenRepository.save(token));
    }

    @Override
    @Transactional(readOnly = true)
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
        int step;
        if ("UP".equalsIgnoreCase(direction)) {
            step = -1;
        } else if ("DOWN".equalsIgnoreCase(direction)) {
            step = 1;
        } else {
            throw new BadRequestException("Invalid direction");
        }

        Token token = lockOwnedToken(tokenId);

        if (token.getStatus() != TokenStatus.WAITING) {
            throw new BadRequestException(
                    "Only waiting tokens can be moved");
        }

        List<Token> waiting = tokenRepository
                .findByQueueIdAndStatusOrderByPositionAsc(
                        token.getQueue().getId(), TokenStatus.WAITING);

        int index = -1;
        for (int i = 0; i < waiting.size(); i++) {
            if (Objects.equals(waiting.get(i).getId(), token.getId())) {
                index = i;
                break;
            }
        }

        int targetIndex = index + step;
        if (index < 0 || targetIndex < 0 || targetIndex >= waiting.size()) {
            throw new BadRequestException("Cannot move token further");
        }

        Token current = waiting.get(index);
        Token other = waiting.get(targetIndex);

        int oldPosition = current.getPosition();
        current.setPosition(other.getPosition());
        other.setPosition(oldPosition);

        tokenRepository.saveAll(List.of(current, other));

        return convertToResponse(current);
    }

    @Override
    @Transactional
    public TokenResponse serveNext(Long queueId) {
        lockOwnedQueue(queueId);

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

        return convertToResponse(tokenRepository.save(token));
    }

    @Override
    @Transactional
    public TokenResponse completeToken(Long tokenId) {
        Token token = lockOwnedToken(tokenId);

        if (token.getStatus() != TokenStatus.SERVING) {
            throw new BadRequestException(
                    "Token is not being served");
        }

        token.setStatus(TokenStatus.SERVED);
        token.setCompletedAt(LocalDateTime.now());

        return convertToResponse(tokenRepository.save(token));
    }

    @Override
    @Transactional
    public TokenResponse cancelToken(Long tokenId) {
        Token token = lockOwnedToken(tokenId);

        if (token.getStatus() != TokenStatus.WAITING) {
            throw new BadRequestException(
                    "Only waiting tokens can be cancelled");
        }

        int cancelledPosition = token.getPosition();
        token.setStatus(TokenStatus.CANCELLED);
        token.setCancelledAt(LocalDateTime.now());

        List<Token> stillWaiting = tokenRepository
                .findByQueueIdAndStatusOrderByPositionAsc(
                        token.getQueue().getId(), TokenStatus.WAITING)
                .stream()
                .filter(t -> !Objects.equals(t.getId(), token.getId()))
                .toList();

        for (Token current : stillWaiting) {
            if (current.getPosition() > cancelledPosition) {
                current.setPosition(current.getPosition() - 1);
            }
        }

        tokenRepository.save(token);
        tokenRepository.saveAll(stillWaiting);

        return convertToResponse(token);
    }
}
