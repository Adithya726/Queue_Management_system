import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/ui/Button';
import QueueTrendChart from './QueueTrendChart';
import { getMyQueues } from '../services/queueService';
import { getQueueAnalytics } from '../services/analyticsService';
import { getErrorMessage } from '../services/api';
import { formatMinutes } from '../utils/format';
import '../manager/manager.css';
import './analytics.css';

function Analytics() {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState(queueId ? String(queueId) : '');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (queueId) {
      setSelectedQueueId(String(queueId));
    }
  }, [queueId]);

  useEffect(() => {
    const loadQueues = async () => {
      try {
        const response = await getMyQueues();
        const list = response.data || [];
        setQueues(list);

        if (!selectedQueueId && list.length > 0) {
          setSelectedQueueId(String(list[0].id));
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load queues for analytics.'));
        setLoading(false);
      }
    };

    loadQueues();
  }, []);

  useEffect(() => {
    if (!selectedQueueId) {
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getQueueAnalytics(selectedQueueId);
        setAnalytics(response.data);
      } catch (err) {
        setAnalytics(null);
        setError(getErrorMessage(err, 'Unable to load analytics.'));
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedQueueId]);

  const handleQueueChange = (event) => {
    const nextId = event.target.value;
    setSelectedQueueId(nextId);
    navigate(`/manager/analytics/${nextId}`);
  };

  if (loading && !analytics) {
    return <Loader label="Loading analytics..." />;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">
            Wait times, service times, cancellations, and queue length trends for one queue.
          </p>
        </div>
        {selectedQueueId ? (
          <Link to={`/manager/queues/${selectedQueueId}`}>
            <Button variant="secondary">Open queue</Button>
          </Link>
        ) : null}
      </div>
      {error ? <div className="alert alert-error">{error}</div> : null}

      {queues.length === 0 ? (
        <EmptyState
          title="No queues to analyse"
          message="Create a queue and serve a few tokens before analytics can appear."
        />
      ) : (
        <>
          <div className="analytics-toolbar">
            <div className="form-field compact-field">
              <label htmlFor="analyticsQueue">Select queue</label>
              <select
                id="analyticsQueue"
                value={selectedQueueId}
                onChange={handleQueueChange}
              >
                {queues.map((queue) => (
                  <option key={queue.id} value={queue.id}>
                    {queue.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {analytics ? (
            <>
              <div className="stats-grid">
                <article className="stat-card accent-sky">
                  <span>Current queue length</span>
                  <strong>{analytics.currentQueueLength}</strong>
                </article>
                <article className="stat-card accent-amber">
                  <span>Average waiting time</span>
                  <strong>{formatMinutes(analytics.averageWaitTime)}</strong>
                </article>
                <article className="stat-card">
                  <span>Longest wait</span>
                  <strong>{formatMinutes(analytics.maxWaitTime)}</strong>
                </article>
                <article className="stat-card accent-teal">
                  <span>Average service time</span>
                  <strong>{formatMinutes(analytics.averageServiceTime)}</strong>
                </article>
                <article className="stat-card">
                  <span>Completed tokens</span>
                  <strong>{analytics.totalServed}</strong>
                </article>
                <article className="stat-card">
                  <span>Cancelled tokens</span>
                  <strong>{analytics.totalCancelled}</strong>
                </article>
              </div>

              <div className="chart-card">
                <h2>Queue length trend</h2>
                <QueueTrendChart trend={analytics.queueLengthTrend} />
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}

export default Analytics;
