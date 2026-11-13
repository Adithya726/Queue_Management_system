
package com.que.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.que.dto.*;
import com.que.exception.ResourceNotFoundException;
import com.que.model.Manager;
import com.que.model.Queue;
import com.que.repository.ManagerRepository;
import com.que.repository.QueueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QueueServiceImpl implements QueueService {

    private final QueueRepository queueRepository;
    private final ManagerRepository managerRepository;

    private Manager getCurrentManager() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        return managerRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Manager not found"));
    }

    @Override
    @Transactional
    public QueueResponse createQueue(QueueRequest request) {

        Manager manager = getCurrentManager();

        Queue queue = new Queue();
        queue.setName(request.getName().trim());
        queue.setManager(manager);

        Queue saved = queueRepository.save(queue);

        return new QueueResponse(
                saved.getId(),
                saved.getName(),
                saved.getCreatedAt());
    }

    @Override
    public List<QueueResponse> getMyQueues() {

        Manager manager = getCurrentManager();

        return queueRepository.findByManagerId(manager.getId())
                .stream()
                .map(q -> new QueueResponse(
                        q.getId(),
                        q.getName(),
                        q.getCreatedAt()))
                .toList();
    }
}
