import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layers, Search } from 'lucide-react';
import CreateQueue from '../queue/CreateQueue';
import QueueList from '../queue/QueueList';
import { PageSkeleton } from '../components/ui/Skeleton';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { loadQueueOverview } from '../services/overviewService';
import { getErrorMessage } from '../services/api';

function ManageQueues() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadQueues = useCallback(async () => {
    try {
      setQueues(await loadQueueOverview());
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load queues.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueues();
  }, [loadQueues]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? queues.filter((q) => q.name.toLowerCase().includes(term)) : queues;
  }, [queues, search]);

  return (
    <section>
      <PageHeader
        title="Queues"
        subtitle="Create a queue for each counter, then open it to add people and serve them."
      />
      {error ? <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div> : null}
      <CreateQueue onCreated={loadQueues} />

      {loading ? (
        <PageSkeleton />
      ) : queues.length === 0 ? (
        <EmptyState
          big
          icon={Layers}
          title="No queues yet"
          message="Name your first queue above, for example Billing or Reception, to start issuing tokens."
        />
      ) : (
        <>
          <div className="toolbar">
            <div className="section-title" style={{ margin: 0 }}>
              <h2>
                Your queues <span className="stat-hint">({queues.length})</span>
              </h2>
            </div>
            <div className="input-icon">
              <Search size={16} />
              <input
                className="input"
                placeholder="Search queues"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search queues"
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No matching queues" message={`Nothing matches "${search}".`} />
          ) : (
            <QueueList queues={filtered} />
          )}
        </>
      )}
    </section>
  );
}

export default ManageQueues;
