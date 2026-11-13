package com.que.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.que.model.Queue;
import java.util.List;
import java.util.Optional;

public interface QueueRepository extends JpaRepository<Queue, Long> {

    List<Queue> findByManagerId(Long managerId);

    Optional<Queue> findByIdAndManagerId(Long id, Long managerId);
}