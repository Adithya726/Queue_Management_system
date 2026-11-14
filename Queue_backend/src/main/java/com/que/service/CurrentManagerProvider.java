package com.que.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.que.exception.ResourceNotFoundException;
import com.que.model.Manager;
import com.que.repository.ManagerRepository;

import lombok.RequiredArgsConstructor;

/**
 * Resolves the manager behind the current request from the email the JWT
 * filter put in the security context. Shared by every service so ownership
 * checks are written once.
 */
@Component
@RequiredArgsConstructor
public class CurrentManagerProvider {

    private final ManagerRepository managerRepository;

    public Manager get() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        return managerRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Manager not found"));
    }
}
