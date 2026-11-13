import { useEffect, useState } from 'react';
import CreateQueue from '../queue/CreateQueue';
import QueueList from '../queue/QueueList';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/common/EmptyState';
import { getMyQueues } from '../services/queueService';
import { getQueueAnalytics } from '../services/analyticsService';
import { getErrorMessage } from '../services/api';
import './manager.css';

function ManageQueues() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQueues = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getMyQueues();
      const list = response.data || [];
      const withCounts = await Promise.all(
        list.map(async (queue) => {
          try {
            const analytics = await getQueueAnalytics(queue.id);
            return {
              ...queue,
              waitingCount: analytics.data?.currentQueueLength ?? 0,
              averageWaitTime: analytics.data?.averageWaitTime ?? 0,
            };
          } catch {
            return { ...queue, waitingCount: 0, averageWaitTime: 0 };
          }
        })
      );
      setQueues(withCounts);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load queues.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueues();
  }, []);

  return (
    <section>
      <h1 className="page-title">Manage queues</h1>
      <p className="page-subtitle">
        Each queue needs a name. Open one to add people, move tokens, serve the top of the list, or cancel a token.
      </p>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <CreateQueue onCreated={loadQueues} />
      {loading ? (
        <Loader label="Loading queues..." />
      ) : queues.length === 0 ? (
        <EmptyState
          title="No queues yet"
          message="Create your first named queue to start issuing tokens."
        />
      ) : (
        <QueueList queues={queues} />
      )}
    </section>
  );
}

export default ManageQueues;
