import api from './api';

export function getQueueAnalytics(queueId) {
  return api.get(`/api/queues/${queueId}/analytics`);
}
