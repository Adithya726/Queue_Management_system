import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/common/EmptyState';
import QueueTrendChart from '../analytics/QueueTrendChart';
import { getMyQueues } from '../services/queueService';
import { getQueueAnalytics } from '../services/analyticsService';
import { getErrorMessage } from '../services/api';
import { formatMinutes } from '../utils/format';
import './manager.css';

function Dashboard() {
  const [queues, setQueues] = useState([]);
  const [analyticsByQueue, setAnalyticsByQueue] = useState({});
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const queuesResponse = await getMyQueues();
        const list = queuesResponse.data || [];
        setQueues(list);

        const entries = await Promise.all(
          list.map(async (queue) => {
            try {
              const response = await getQueueAnalytics(queue.id);
              return [String(queue.id), response.data];
            } catch {
              return [String(queue.id), null];
            }
          })
        );

        const nextAnalytics = Object.fromEntries(entries);
        setAnalyticsByQueue(nextAnalytics);

        setSelectedQueueId((current) => {
          if (current && nextAnalytics[current]) {
            return current;
          }
          return list[0] ? String(list[0].id) : '';
        });
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load dashboard data.'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totals = useMemo(() => {
    const values = Object.values(analyticsByQueue).filter(Boolean);
    const waitingCustomers = values.reduce(
      (sum, item) => sum + (item.currentQueueLength || 0),
      0
    );
    const completedTokens = values.reduce(
      (sum, item) => sum + (item.totalServed || 0),
      0
    );
    const cancelledTokens = values.reduce(
      (sum, item) => sum + (item.totalCancelled || 0),
      0
    );
    const waitSamples = values.filter((item) => Number(item.averageWaitTime) > 0);
    const serviceSamples = values.filter(
      (item) => Number(item.averageServiceTime) > 0
    );

    return {
      totalQueues: queues.length,
      waitingCustomers,
      completedTokens,
      cancelledTokens,
      averageWaitTime:
        waitSamples.length === 0
          ? 0
          : waitSamples.reduce((sum, item) => sum + item.averageWaitTime, 0) /
            waitSamples.length,
      averageServiceTime:
        serviceSamples.length === 0
          ? 0
          : serviceSamples.reduce((sum, item) => sum + item.averageServiceTime, 0) /
            serviceSamples.length,
    };
  }, [analyticsByQueue, queues.length]);

  const selectedAnalytics = analyticsByQueue[selectedQueueId];
  const selectedQueue = queues.find((queue) => String(queue.id) === selectedQueueId);

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Wait times, queue length, and service activity across every queue you manage.
          </p>
        </div>
        <Link to="/manager/queues">
          <Button>Create or open a queue</Button>
        </Link>
      </div>
      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="stats-grid">
        <article className="stat-card accent-indigo">
          <span>Queues</span>
          <strong>{totals.totalQueues}</strong>
        </article>
        <article className="stat-card accent-sky">
          <span>People waiting</span>
          <strong>{totals.waitingCustomers}</strong>
        </article>
        <article className="stat-card accent-amber">
          <span>Average wait</span>
          <strong>{formatMinutes(totals.averageWaitTime)}</strong>
        </article>
        <article className="stat-card accent-teal">
          <span>Average service</span>
          <strong>{formatMinutes(totals.averageServiceTime)}</strong>
        </article>
        <article className="stat-card">
          <span>Served tokens</span>
          <strong>{totals.completedTokens}</strong>
        </article>
        <article className="stat-card">
          <span>Cancelled tokens</span>
          <strong>{totals.cancelledTokens}</strong>
        </article>
      </div>

      {queues.length === 0 ? (
        <EmptyState
          title="No queues yet"
          message="Create a named queue, add people, and this dashboard will show wait-time and length trends."
          action={
            <Link to="/manager/queues">
              <Button>Create a queue</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="dashboard-grid">
            <article className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h2>Queue length trend</h2>
                  <p>How many people were waiting as tokens were added.</p>
                </div>
                <div className="form-field compact-field">
                  <label htmlFor="dashboardQueue">Queue</label>
                  <select
                    id="dashboardQueue"
                    value={selectedQueueId}
                    onChange={(event) => setSelectedQueueId(event.target.value)}
                  >
                    {queues.map((queue) => (
                      <option key={queue.id} value={queue.id}>
                        {queue.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {selectedAnalytics ? (
                <QueueTrendChart trend={selectedAnalytics.queueLengthTrend} />
              ) : (
                <EmptyState
                  title="Analytics unavailable"
                  message="This queue did not return trend data."
                />
              )}
            </article>

            <article className="queue-summary-card">
              <h2>{selectedQueue?.name || 'Queue'}</h2>
              <ul>
                <li>
                  <span>Current length</span>
                  <strong>{selectedAnalytics?.currentQueueLength ?? 0}</strong>
                </li>
                <li>
                  <span>Average wait</span>
                  <strong>{formatMinutes(selectedAnalytics?.averageWaitTime)}</strong>
                </li>
                <li>
                  <span>Longest wait</span>
                  <strong>{formatMinutes(selectedAnalytics?.maxWaitTime)}</strong>
                </li>
                <li>
                  <span>Average service</span>
                  <strong>{formatMinutes(selectedAnalytics?.averageServiceTime)}</strong>
                </li>
              </ul>
              {selectedQueueId ? (
                <div className="dashboard-actions">
                  <Link to={`/manager/queues/${selectedQueueId}`}>
                    <Button fullWidth>Open waiting list</Button>
                  </Link>
                  <Link to={`/manager/analytics/${selectedQueueId}`}>
                    <Button variant="secondary" fullWidth>
                      Full analytics
                    </Button>
                  </Link>
                </div>
              ) : null}
            </article>
          </div>

          <div className="table-card">
            <h2>All queues</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Waiting</th>
                    <th>Avg wait</th>
                    <th>Served</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {queues.map((queue) => {
                    const analytics = analyticsByQueue[String(queue.id)];
                    return (
                      <tr key={queue.id}>
                        <td>{queue.name}</td>
                        <td>{analytics?.currentQueueLength ?? 0}</td>
                        <td>{formatMinutes(analytics?.averageWaitTime)}</td>
                        <td>{analytics?.totalServed ?? 0}</td>
                        <td>
                          <Link to={`/manager/queues/${queue.id}`}>Open</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
