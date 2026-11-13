package com.que.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.que.model.Manager;
import java.util.Optional;

public interface ManagerRepository extends JpaRepository<Manager, Long> {

    Optional<Manager> findByEmail(String email);

    boolean existsByEmail(String email);
}