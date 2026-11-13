import api from './api';

export function createQueue(payload) {
  return api.post('/api/queues', payload);
}

export function getMyQueues() {
  return api.get('/api/queues');
}
