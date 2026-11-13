package com.que.service;

import java.util.List;
import com.que.dto.QueueRequest;
import com.que.dto.QueueResponse;

public interface QueueService {

    QueueResponse createQueue(QueueRequest request);

    List<QueueResponse> getMyQueues();
}