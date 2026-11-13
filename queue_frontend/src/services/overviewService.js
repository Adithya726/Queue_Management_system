import { getMyQueues } from './queueService';
import { getQueueTokens } from './tokenService';
import { getQueueAnalytics } from './analyticsService';

/**
 * Loads every queue of the logged-in manager together with its live tokens
 * (waiting + serving) and its analytics. Uses only the existing API endpoints.
 */
export async function loadQueueOverview() {
  const { data } = await getMyQueues();
  const queues = data || [];

  return Promise.all(
    queues.map(async (queue) => {
      const [tokensRes, analyticsRes] = await Promise.all([
        getQueueTokens(queue.id).catch(() => ({ data: [] })),
        getQueueAnalytics(queue.id).catch(() => ({ data: null })),
      ]);

      const tokens = tokensRes.data || [];
      const waiting = tokens
        .filter((token) => token.status === 'WAITING')
        .sort((a, b) => a.position - b.position);
      const serving = tokens.find((token) => token.status === 'SERVING') || null;
      const analytics = analyticsRes.data || {};

      return {
        ...queue,
        waiting,
        serving,
        next: waiting[0] || null,
        waitingCount: waiting.length,
        servedCount: analytics.totalServed || 0,
        cancelledCount: analytics.totalCancelled || 0,
        averageWaitTime: analytics.averageWaitTime || 0,
        averageServiceTime: analytics.averageServiceTime || 0,
        maxWaitTime: analytics.maxWaitTime || 0,
      };
    })
  );
}
