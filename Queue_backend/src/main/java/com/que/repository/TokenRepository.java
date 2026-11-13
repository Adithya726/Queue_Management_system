package com.que.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.que.model.Token;
import com.que.model.TokenStatus;
import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {

    List<Token> findByQueueIdAndStatusOrderByPositionAsc(
            Long queueId, TokenStatus status);

    Optional<Token> findFirstByQueueIdAndStatusOrderByPositionAsc(
            Long queueId, TokenStatus status);

    Integer countByQueueId(Long queueId);

    Integer countByQueueIdAndStatus(Long queueId, TokenStatus status);

    List<Token> findByQueueIdOrderByCreatedAtAsc(Long queueId);
}