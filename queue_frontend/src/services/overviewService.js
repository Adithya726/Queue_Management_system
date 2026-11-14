import api from './api';

/**
 * Loads every queue of the logged-in manager with its live status
 * (waiting count, who is being served, who is next, totals) in one request.
 */
export async function loadQueueOverview() {
  const { data } = await api.get('/api/queues/overview');
  return (data || []).map((queue) => ({
    ...queue,
    waitingCount: queue.waitingCount || 0,
    servedCount: queue.servedCount || 0,
    cancelledCount: queue.cancelledCount || 0,
    averageWaitTime: queue.averageWaitTime || 0,
    waitSampleCount: queue.waitSampleCount || 0,
  }));
}
