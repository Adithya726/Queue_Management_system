import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CircleCheck,
  Clock,
  Flame,
  Hourglass,
  Layers,
  Play,
  Plus,
  RefreshCw,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import { PageSkeleton } from '../components/ui/Skeleton';
import PageHeader from '../components/common/PageHeader';
import ChartCard from '../components/common/ChartCard';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../contextapi/AuthContext';
import { loadQueueOverview } from '../services/overviewService';
import { serveNextToken } from '../services/tokenService';
import { getErrorMessage } from '../services/api';
import { formatMinutes, greeting, ticket, todayLabel } from '../utils/format';

const REFRESH_MS = 30000;

function Dashboard() {
  const { auth } = useAuth();
  const toast = useToast();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyQueueId, setBusyQueueId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    }
    try {
      setQueues(await loadQueueOverview());
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load dashboard data.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const handleServe = async (queue) => {
    setBusyQueueId(queue.id);
    try {
      const { data } = await serveNextToken(queue.id);
      toast.success(`Now serving ${ticket(data.tokenNumber)} · ${data.personName}`);
      await load(true);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to serve the next token.'));
    } finally {
      setBusyQueueId(null);
    }
  };

  const totals = useMemo(() => {
    const waiting = queues.reduce((sum, q) => sum + q.waitingCount, 0);
    const serving = queues.filter((q) => q.serving).length;
    const served = queues.reduce((sum, q) => sum + q.servedCount, 0);
    const withWait = queues.filter((q) => q.averageWaitTime > 0);
    const avgWait = withWait.length
      ? withWait.reduce((sum, q) => sum + q.averageWaitTime, 0) / withWait.length
      : 0;
    return { waiting, serving, served, avgWait };
  }, [queues]);

  const busiest = useMemo(
    () =>
      queues.reduce(
        (top, q) => (!top || q.waitingCount > top.waitingCount ? q : top),
        null
      ),
    [queues]
  );

  const chartData = useMemo(
    () =>
      queues.map((q) => ({
        name: q.name.length > 14 ? `${q.name.slice(0, 13)}…` : q.name,
        Waiting: q.waitingCount,
        Served: q.servedCount,
      })),
    [queues]
  );

  if (loading) {
    return <PageSkeleton />;
  }

  const today = todayLabel();

  return (
    <section>
      <PageHeader
        title={`${greeting()}, ${(auth?.name || 'Manager').split(' ')[0]}`}
        subtitle={
          <>
            {today} · <span className="live-dot">Live, refreshes every 30s</span>
          </>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => load(true)} disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              {refreshing ? 'Refreshing' : 'Refresh'}
            </Button>
            <Link to="/manager/queues">
              <Button>
                <Plus size={16} /> New queue
              </Button>
            </Link>
          </>
        }
      />

      {error ? <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div> : null}

      {queues.length === 0 ? (
        <EmptyState
          big
          icon={Layers}
          title="Create your first queue"
          message="Queues are your counters: billing, reception, consultation. Create one, add people, and this dashboard comes alive."
          action={
            <Link to="/manager/queues">
              <Button size="lg">
                <Plus size={18} /> Create a queue
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="People waiting now"
              value={totals.waiting}
              hint={`across ${queues.length} queue${queues.length === 1 ? '' : 's'}`}
              icon={Users}
              tone="waiting"
            />
            <StatCard
              label="Being served"
              value={totals.serving}
              hint={`${queues.length - totals.serving} counter${queues.length - totals.serving === 1 ? '' : 's'} free`}
              icon={UserCheck}
              tone="serving"
            />
            <StatCard
              label="Served so far"
              value={totals.served}
              hint="completed tokens"
              icon={CircleCheck}
              tone="served"
            />
            <StatCard
              label="Average wait"
              value={formatMinutes(totals.avgWait)}
              hint="join to counter"
              icon={Clock}
              tone="primary"
            />
          </div>

          <div className="dash-grid">
            <div>
              <div className="section-title">
                <h2>Live queues</h2>
                <Link to="/manager/queues" className="breadcrumb">
                  Manage all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="live-grid">
                {queues.map((queue) => (
                  <article key={queue.id} className="live-card">
                    <div className="live-card-top">
                      <h3>{queue.name}</h3>
                      {queue.serving ? (
                        <span className="badge badge-serving">Serving</span>
                      ) : queue.waitingCount > 5 ? (
                        <span className="badge badge-busy">Busy</span>
                      ) : (
                        <span className="badge badge-idle">Counter free</span>
                      )}
                    </div>
                    <div className="live-counts">
                      <div>
                        <strong>{queue.waitingCount}</strong>
                        <span>Waiting</span>
                      </div>
                      <div>
                        <strong>{queue.servedCount}</strong>
                        <span>Served</span>
                      </div>
                      <div>
                        <strong>{formatMinutes(queue.averageWaitTime)}</strong>
                        <span>Avg wait</span>
                      </div>
                    </div>
                    <div className="live-rows">
                      <div className="live-row">
                        <span>Now serving</span>
                        <strong>
                          {queue.serving
                            ? `${ticket(queue.serving.tokenNumber)} · ${queue.serving.personName}`
                            : 'Nobody'}
                        </strong>
                      </div>
                      <div className="live-row">
                        <span>Next in line</span>
                        <strong>
                          {queue.next
                            ? `${ticket(queue.next.tokenNumber)} · ${queue.next.personName}`
                            : 'Empty'}
                        </strong>
                      </div>
                    </div>
                    <div className="live-actions">
                      <Link to={`/manager/queues/${queue.id}`}>
                        <Button variant="secondary" fullWidth>
                          Open
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleServe(queue)}
                        disabled={!queue.next || Boolean(queue.serving) || busyQueueId === queue.id}
                        title={queue.serving ? 'Complete the current token first' : undefined}
                      >
                        <Play size={15} /> Serve next
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="side-stack">
              {busiest ? (
                <div className="spotlight">
                  <span className="spotlight-label">
                    <Flame size={16} /> Busiest queue
                  </span>
                  <h3>{busiest.name}</h3>
                  <div className="spotlight-stats">
                    <div>
                      <strong>{busiest.waitingCount}</strong>
                      <span>waiting</span>
                    </div>
                    <div>
                      <strong>{formatMinutes(busiest.averageServiceTime)}</strong>
                      <span>per person</span>
                    </div>
                  </div>
                  <Link to={`/manager/queues/${busiest.id}`}>
                    <Button fullWidth>
                      Go to counter <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              ) : null}

              <section className="card">
                <div className="card-header">
                  <div>
                    <h2>Load by queue</h2>
                    <p>People waiting right now</p>
                  </div>
                  <Hourglass size={18} color="#94a3b8" />
                </div>
                <div className="mini-list">
                  {queues.map((queue) => {
                    const max = Math.max(1, ...queues.map((q) => q.waitingCount));
                    return (
                      <div key={queue.id} className="mini-item">
                        <span className="mini-item-name">{queue.name}</span>
                        <div className="mini-item-bar">
                          <span style={{ width: `${(queue.waitingCount / max) * 100}%` }} />
                        </div>
                        <span className="mini-item-val">{queue.waitingCount}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          <ChartCard
            title="Waiting vs served"
            subtitle="Today's workload for every queue"
            action={
              <Link to="/manager/analytics">
                <Button variant="ghost" size="sm">
                  Full analytics <ArrowRight size={14} />
                </Button>
              </Link>
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f5f7fb' }} contentStyle={{ borderRadius: 10, border: '1px solid #e6e9f0' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="Waiting" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Served" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </section>
  );
}

export default Dashboard;
