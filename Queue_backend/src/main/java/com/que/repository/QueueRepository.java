package com.que.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.que.model.Queue;

public interface QueueRepository extends JpaRepository<Queue, Long> {

    List<Queue> findByManagerIdOrderByCreatedAtAsc(Long managerId);

    Optional<Queue> findByIdAndManagerId(Long id, Long managerId);

    /**
     * Loads the queue with a row lock (SELECT ... FOR UPDATE). Every write on a
     * queue's tokens goes through this, so two requests on the same queue run
     * one after the other instead of racing.
     */
    // Native "FOR UPDATE" works the same on MySQL, MariaDB and H2.
    @Query(value = "SELECT * FROM queues WHERE id = :id AND manager_id = :managerId FOR UPDATE",
            nativeQuery = true)
    Optional<Queue> findOwnedForUpdate(
            @Param("id") Long id, @Param("managerId") Long managerId);
}
