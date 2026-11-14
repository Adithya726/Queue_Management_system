package com.que.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.que.model.Token;
import com.que.model.TokenStatus;

public interface TokenRepository extends JpaRepository<Token, Long> {

    List<Token> findByQueueIdAndStatusOrderByPositionAsc(
            Long queueId, TokenStatus status);

    List<Token> findByQueueIdAndStatusInOrderByPositionAsc(
            Long queueId, Collection<TokenStatus> statuses);

    Optional<Token> findFirstByQueueIdAndStatusOrderByPositionAsc(
            Long queueId, TokenStatus status);

    long countByQueueIdAndStatus(Long queueId, TokenStatus status);

    List<Token> findByQueueIdOrderByCreatedAtAsc(Long queueId);

    List<Token> findByQueueIdIn(Collection<Long> queueIds);

    @Query("select coalesce(max(t.tokenNumber), 0) from Token t where t.queue.id = :queueId")
    int findMaxTokenNumber(@Param("queueId") Long queueId);

    @Query("select t.queue.id from Token t where t.id = :tokenId")
    Optional<Long> findQueueIdByTokenId(@Param("tokenId") Long tokenId);
}
