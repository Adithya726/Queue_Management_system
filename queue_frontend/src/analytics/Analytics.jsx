import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ChartColumn,
  CircleCheck,
  CircleX,
  Clock,
  Gauge,
  Lightbulb,
  Mountain,
  Target,
  Ticket,
  Timer,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import { PageSkeleton, Skeleton } from '../components/ui/Skeleton';
import PageHeader from '../components/common/PageHeader';
import ChartCard from '../components/common/ChartCard';
import EmptyState from '../components/common/EmptyState';
import QueueTrendChart from './QueueTrendChart';
import { getMyQueues } from '../services/queueService';
import { getQueueAnalytics } from '../services/analyticsService';
import { getQueueTokens } from '../services/tokenService';
import { getErrorMessage } from '../services/api';
import { formatMinutes, percent } from '../utils/format';

const COLORS = {
  Served: '#10b981',
  Waiting: '#f59e0b',
  Serving: '#3b82f6',
  Cancelled: '#ef4444',
};

function Analytics() {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [servingCount, setServingCount] = useState(0);
  const [loadingQueues, setLoadingQueues] = useState(true);
  const [loadedQueueId, setLoadedQueueId] = useState('');
  const [error, setError] = useState('');

  const selectedQueueId = queueId || (queues[0] ? String(queues[0].id) : '');

  useEffect(() => {
    const loadQueues = async () => {
      try {
        const { data } = await getMyQueues();
        setQueues(data || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load queues.'));
      } finally {
        setLoadingQueues(false);
      }
    };
    loadQueues();
  }, []);

  const loadAnalytics = useCallback(
    (id) =>
      Promise.all([
        getQueueAnalytics(id),
        getQueueTokens(id).catch(() => ({ data: [] })),
      ])
        .then(([analyticsRes, tokensRes]) => {
          setAnalytics(analyticsRes.data);
          setServingCount((tokensRes.data || []).filter((t) => t.status === 'SERVING').length);
          setError('');
        })
        .catch((err) => {
          setAnalytics(null);
          setError(getErrorMessage(err, 'Unable to load analytics.'));
        })
        .finally(() => setLoadedQueueId(id)),
    []
  );

  useEffect(() => {
    if (selectedQueueId) {
      loadAnalytics(selectedQueueId);
    }
  }, [selectedQueueId, loadAnalytics]);

  // Loading while the selected queue's data has not arrived yet.
  const loadingData = Boolean(selectedQueueId) && loadedQueueId !== selectedQueueId;

  const metrics = useMemo(() => {
    if (!analytics) {
      return null;
    }
    const served = analytics.totalServed || 0;
    const cancelled = analytics.totalCancelled || 0;
    const waiting = analytics.currentQueueLength || 0;
    const total = served + cancelled + waiting + servingCount;
    const peak = analytics.peakQueueLength || 0;
    return {
      served,
      cancelled,
      waiting,
      serving: servingCount,
      total,
      peak,
      completionRate: percent(served, total),
      cancelRate: percent(cancelled, total),
      avgWait: analytics.averageWaitTime || 0,
      maxWait: analytics.maxWaitTime || 0,
      avgService: analytics.averageServiceTime || 0,
    };
  }, [analytics, servingCount]);

  const donutData = useMemo(() => {
    if (!metrics) {
      return [];
    }
    return [
      { name: 'Served', value: metrics.served },
      { name: 'Waiting', value: metrics.waiting },
      { name: 'Serving', value: metrics.serving },
      { name: 'Cancelled', value: metrics.cancelled },
    ];
  }, [metrics]);

  const timeData = useMemo(() => {
    if (!metrics) {
      return [];
    }
    return [
      { name: 'Avg wait', minutes: Number(metrics.avgWait.toFixed(2)), fill: '#6366f1' },
      { name: 'Avg service', minutes: Number(metrics.avgService.toFixed(2)), fill: '#10b981' },
      { name: 'Longest wait', minutes: Number(metrics.maxWait.toFixed(2)), fill: '#f59e0b' },
    ];
  }, [metrics]);

  const insights = useMemo(() => {
    if (!metrics || metrics.total === 0) {
      return [];
    }
    const list = [];
    if (metrics.avgWait > 0 || metrics.avgService > 0) {
      list.push({
        icon: Clock,
        text: `People wait ${formatMinutes(metrics.avgWait)} on average, then spend ${formatMinutes(metrics.avgService)} at the counter.`,
      });
    }
    list.push({
      icon: Target,
      text: `${metrics.completionRate}% of all tokens issued have been served${metrics.cancelled ? `, and ${metrics.cancelRate}% were cancelled` : ' with no cancellations'}.`,
    });
    if (metrics.peak > 0) {
      list.push({
        icon: Mountain,
        text: `The queue peaked at ${metrics.peak} ${metrics.peak === 1 ? 'person' : 'people'} waiting at once.`,
      });
    }
    if (metrics.waiting > 0 && metrics.avgService > 0) {
      list.push({
        icon: Timer,
        text: `Clearing the ${metrics.waiting} people waiting now should take about ${formatMinutes(metrics.waiting * metrics.avgService)}.`,
      });
    }
    return list;
  }, [metrics]);

  const handleQueueChange = (event) => {
    navigate(`/manager/analytics/${event.target.value}`);
  };

  if (loadingQueues) {
    return <PageSkeleton />;
  }

  if (queues.length === 0) {
    return (
      <EmptyState
        big
        icon={ChartColumn}
        title="No queues to analyse yet"
        message="Create a queue and serve a few people. Wait times, outcomes and trends will appear here."
        action={
          <Link to="/manager/queues">
            <Button>Create a queue</Button>
          </Link>
        }
      />
    );
  }

  const selectedQueue = queues.find((q) => String(q.id) === selectedQueueId);

  return (
    <section>
      <PageHeader
        title="Analytics"
        subtitle={`Performance and trends for ${selectedQueue?.name || 'this queue'}`}
        actions={
          <>
            <select
              className="select"
              value={selectedQueueId}
              onChange={handleQueueChange}
              aria-label="Select queue"
            >
              {queues.map((queue) => (
                <option key={queue.id} value={queue.id}>
                  {queue.name}
                </option>
              ))}
            </select>
            <Link to={`/manager/queues/${selectedQueueId}`}>
              <Button variant="secondary">
                Open queue <ArrowRight size={16} />
              </Button>
            </Link>
          </>
        }
      />

      {error ? <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div> : null}

      {loadingData && !metrics ? (
        <Skeleton height={420} />
      ) : metrics ? (
        <>
          <div className="stats-grid six">
            <StatCard label="Tokens issued" value={metrics.total} hint="all time" icon={Ticket} tone="primary" />
            <StatCard label="Served" value={metrics.served} hint={`${metrics.completionRate}% completion`} icon={CircleCheck} tone="served" />
            <StatCard label="Cancelled" value={metrics.cancelled} hint={`${metrics.cancelRate}% of tokens`} icon={CircleX} tone="cancelled" />
            <StatCard label="Average wait" value={formatMinutes(metrics.avgWait)} hint={`longest ${formatMinutes(metrics.maxWait)}`} icon={Clock} tone="waiting" />
            <StatCard label="Average service" value={formatMinutes(metrics.avgService)} hint="time at counter" icon={Timer} tone="serving" />
            <StatCard label="Peak queue" value={metrics.peak} hint={`${metrics.waiting} waiting now`} icon={Gauge} tone="slate" />
          </div>

          <div className="charts-grid">
            <ChartCard title="Queue length over time" subtitle="People waiting after every join, serve or cancel">
              <QueueTrendChart trend={analytics.queueLengthTrend} />
            </ChartCard>

            <ChartCard title="Token outcomes" subtitle="Where every token ended up">
              {metrics.total === 0 ? (
                <EmptyState title="No tokens yet" message="Issue a token to see outcomes." />
              ) : (
                <>
                  <div className="donut-wrap">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={donutData.filter((d) => d.value > 0)}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={66}
                          outerRadius={96}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {donutData
                            .filter((d) => d.value > 0)
                            .map((entry) => (
                              <Cell key={entry.name} fill={COLORS[entry.name]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e6e9f0' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center">
                      <div>
                        <strong>{metrics.total}</strong>
                        <span>tokens</span>
                      </div>
                    </div>
                  </div>
                  <div className="legend">
                    {donutData.map((entry) => (
                      <div key={entry.name} className="legend-item">
                        <i style={{ background: COLORS[entry.name] }} />
                        {entry.name}
                        <strong>{entry.value}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>
          </div>

          <div className="charts-grid even">
            <ChartCard title="Time breakdown" subtitle="Minutes per person">
              {metrics.avgWait === 0 && metrics.avgService === 0 && metrics.maxWait === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No timings yet"
                  message="Serve and complete a token to measure wait and service time."
                />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={timeData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => formatMinutes(value)} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#334155', fontSize: 13 }} axisLine={false} tickLine={false} width={96} />
                    <Tooltip
                      cursor={{ fill: '#f5f7fb' }}
                      formatter={(value) => [formatMinutes(value), 'Time']}
                      contentStyle={{ borderRadius: 10, border: '1px solid #e6e9f0' }}
                    />
                    <Bar dataKey="minutes" radius={[0, 8, 8, 0]} maxBarSize={28}>
                      {timeData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Insights" subtitle="What the numbers say">
              {insights.length === 0 ? (
                <EmptyState icon={Lightbulb} title="Nothing to report yet" message="Insights appear once tokens are issued." />
              ) : (
                <>
                  <div className="insights">
                    {insights.map(({ icon: Icon, text }) => (
                      <div key={text} className="insight">
                        <span className="insight-icon">
                          <Icon size={16} />
                        </span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rate-bar" aria-hidden="true">
                    {donutData.map((entry) => (
                      <span
                        key={entry.name}
                        style={{
                          width: `${percent(entry.value, metrics.total)}%`,
                          background: COLORS[entry.name],
                        }}
                      />
                    ))}
                  </div>
                  <span className="stat-hint">Share of tokens by outcome</span>
                </>
              )}
            </ChartCard>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default Analytics;
