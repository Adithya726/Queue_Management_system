package com.que.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.que.dto.QueueOverviewResponse;
import com.que.dto.QueueRequest;
import com.que.dto.QueueResponse;
import com.que.dto.TokenResponse;
import com.que.exception.ResourceNotFoundException;
import com.que.model.Manager;
import com.que.model.Queue;
import com.que.model.Token;
import com.que.model.TokenStatus;
import com.que.repository.QueueRepository;
import com.que.repository.TokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QueueServiceImpl implements QueueService {

    private final QueueRepository queueRepository;
    private final TokenRepository tokenRepository;
    private final CurrentManagerProvider currentManager;

    private static QueueResponse toResponse(Queue q) {
        return new QueueResponse(q.getId(), q.getName(), q.getCreatedAt());
    }

    private static TokenResponse toResponse(Token t) {
        return new TokenResponse(
                t.getId(), t.getTokenNumber(), t.getPersonName(), t.getStatus(),
                t.getPosition(), t.getCreatedAt(), t.getServingStartedAt(),
                t.getCompletedAt(), t.getCancelledAt());
    }

    @Override
    @Transactional
    public QueueResponse createQueue(QueueRequest request) {
        Manager manager = currentManager.get();

        Queue queue = new Queue();
        queue.setName(request.getName().trim());
        queue.setManager(manager);

        return toResponse(queueRepository.save(queue));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QueueResponse> getMyQueues() {
        return queueRepository
                .findByManagerIdOrderByCreatedAtAsc(currentManager.get().getId())
                .stream()
                .map(QueueServiceImpl::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QueueResponse getQueue(Long queueId) {
        return queueRepository
                .findByIdAndManagerId(queueId, currentManager.get().getId())
                .map(QueueServiceImpl::toResponse)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Queue not found"));
    }

    /**
     * Everything the dashboard needs for all of a manager's queues in two
     * queries (queues, then their tokens), instead of two calls per queue.
     */
    @Override
    @Transactional(readOnly = true)
    public List<QueueOverviewResponse> getOverview() {
        List<Queue> queues = queueRepository
                .findByManagerIdOrderByCreatedAtAsc(currentManager.get().getId());

        if (queues.isEmpty()) {
            return List.of();
        }

        Map<Long, List<Token>> tokensByQueue = tokenRepository
                .findByQueueIdIn(queues.stream().map(Queue::getId).toList())
                .stream()
                .collect(Collectors.groupingBy(t -> t.getQueue().getId()));

        return queues.stream().map(queue -> {
            List<Token> tokens = tokensByQueue.getOrDefault(queue.getId(), List.of());

            List<Token> waiting = tokens.stream()
                    .filter(t -> t.getStatus() == TokenStatus.WAITING)
                    .sorted(Comparator.comparing(Token::getPosition))
                    .toList();

            Token serving = tokens.stream()
                    .filter(t -> t.getStatus() == TokenStatus.SERVING)
                    .findFirst()
                    .orElse(null);

            int served = (int) tokens.stream()
                    .filter(t -> t.getStatus() == TokenStatus.SERVED).count();
            int cancelled = (int) tokens.stream()
                    .filter(t -> t.getStatus() == TokenStatus.CANCELLED).count();

            double totalWait = 0;
            int waitCount = 0;
            for (Token t : tokens) {
                Double wait = AnalyticsMath.waitMinutes(t);
                if (wait != null) {
                    totalWait += wait;
                    waitCount++;
                }
            }

            return new QueueOverviewResponse(
                    queue.getId(),
                    queue.getName(),
                    queue.getCreatedAt(),
                    waiting.size(),
                    serving == null ? null : toResponse(serving),
                    waiting.isEmpty() ? null : toResponse(waiting.get(0)),
                    served,
                    cancelled,
                    waitCount == 0 ? 0 : totalWait / waitCount,
                    waitCount);
        }).toList();
    }
}
