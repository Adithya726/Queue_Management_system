import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ChartColumn,
  ChevronRight,
  CircleCheck,
  Coffee,
  Play,
  Timer,
  Trash2,
  Users,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PageSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/useToast';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import AddPerson from '../queue/AddPerson';
import WaitingList from '../queue/WaitingList';
import { getQueue } from '../services/queueService';
import { getQueueAnalytics } from '../services/analyticsService';
import {
  cancelToken,
  completeToken,
  getQueueTokens,
  moveToken,
  serveNextToken,
  splitQueueTokens,
} from '../services/tokenService';
import { getErrorMessage } from '../services/api';
import { formatMinutes, startedLabel, ticket } from '../utils/format';

function QueueDetails() {
  const { queueId } = useParams();
  const toast = useToast();
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [servingToken, setServingToken] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmToken, setConfirmToken] = useState(null);

  const loadQueueData = useCallback(
    () =>
      Promise.all([
        getQueue(queueId),
        getQueueTokens(queueId),
        getQueueAnalytics(queueId).catch(() => null),
      ])
        .then(([queueResponse, tokensResponse, analyticsResponse]) => {
          const { waiting, serving } = splitQueueTokens(tokensResponse.data || []);
          setQueue(queueResponse.data);
          setTokens(waiting);
          setServingToken(serving);
          setStats(analyticsResponse?.data || {});
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setQueue(null);
          } else {
            toast.error(getErrorMessage(err, 'Unable to load this queue.'));
          }
        })
        .finally(() => setLoading(false)),
    [queueId, toast]
  );

  useEffect(() => {
    loadQueueData();
  }, [loadQueueData]);

  // Reload every 15s so the list stays current if another device changes this
  // queue, and so the "waiting X min" / "serving for X min" labels stay fresh.
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) {
        loadQueueData();
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [loadQueueData]);

  const runAction = async (action, successMessage, fallbackError) => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const result = await action();
      const message =
        typeof successMessage === 'function' ? successMessage(result) : successMessage;
      if (message) {
        toast.success(message);
      }
      await loadQueueData();
    } catch (err) {
      toast.error(getErrorMessage(err, fallbackError));
    } finally {
      setBusy(false);
    }
  };

  const handleServeNext = () =>
    runAction(
      () => serveNextToken(queueId),
      (res) => `Now serving ${ticket(res.data.tokenNumber)} · ${res.data.personName}`,
      'Unable to assign the next token for service.'
    );

  const handleComplete = () =>
    runAction(
      () => completeToken(servingToken.id),
      `${ticket(servingToken.tokenNumber)} · ${servingToken.personName} has been served`,
      'Unable to complete this token.'
    );

  const handleMove = (token, direction) =>
    runAction(() => moveToken(token.id, direction), null, 'Unable to move this token.');

  const handleCancel = async () => {
    const token = confirmToken;
    setConfirmToken(null);
    await runAction(
      () => cancelToken(token.id),
      `${ticket(token.tokenNumber)} · ${token.personName} was cancelled`,
      'Unable to cancel this token.'
    );
  };

  const closeModal = useCallback(() => setConfirmToken(null), []);

  if (loading) {
    return <PageSkeleton />;
  }

  if (!queue) {
    return (
      <EmptyState
        big
        title="Queue not found"
        message="This queue does not exist or belongs to another manager."
        action={
          <Link to="/manager/queues">
            <Button variant="secondary">Back to queues</Button>
          </Link>
        }
      />
    );
  }

  const nextToken = tokens[0];

  return (
    <section>
      <PageHeader
        breadcrumb={
          <>
            <Link to="/manager/queues">Queues</Link>
            <ChevronRight size={14} />
            <span>{queue.name}</span>
          </>
        }
        title={queue.name}
        actions={
          <Link to={`/manager/analytics/${queueId}`}>
            <Button variant="secondary">
              <ChartColumn size={16} /> Analytics
            </Button>
          </Link>
        }
      />

      <div className="stat-strip" style={{ marginBottom: 22 }}>
        <span className="strip-item">
          <i className="dot" style={{ background: 'var(--waiting)' }} />
          Waiting <strong>{tokens.length}</strong>
        </span>
        <span className="strip-item">
          <i className="dot" style={{ background: 'var(--served)' }} />
          Served <strong>{stats.totalServed ?? 0}</strong>
        </span>
        <span className="strip-item">
          <i className="dot" style={{ background: 'var(--cancelled)' }} />
          Cancelled <strong>{stats.totalCancelled ?? 0}</strong>
        </span>
        <span className="strip-item">
          <i className="dot" style={{ background: 'var(--primary)' }} />
          Avg wait <strong>{formatMinutes(stats.averageWaitTime)}</strong>
        </span>
        <span className="strip-item">
          <i className="dot" style={{ background: 'var(--serving)' }} />
          Avg service <strong>{formatMinutes(stats.averageServiceTime)}</strong>
        </span>
      </div>

      <div className="ops-grid">
        <aside className={`serving-panel ${servingToken ? 'is-active' : ''}`}>
          <div className="serving-head">
            <span>Now serving</span>
            {servingToken ? (
              <span className="badge badge-serving" style={{ opacity: 1, letterSpacing: 0 }}>
                At counter
              </span>
            ) : (
              <span className="badge badge-idle" style={{ opacity: 1, letterSpacing: 0 }}>
                Counter free
              </span>
            )}
          </div>

          {servingToken ? (
            <>
              <div className="serving-ticket">
                <span className="ticket-no">{ticket(servingToken.tokenNumber)}</span>
                <span className="person">{servingToken.personName}</span>
              </div>
              <div className="serving-timer">
                <Timer size={16} /> {startedLabel(servingToken.servingStartedAt)}
              </div>
              <Button variant="success" size="lg" fullWidth onClick={handleComplete} disabled={busy}>
                <CircleCheck size={18} /> Complete service
              </Button>
            </>
          ) : (
            <>
              <div className="serving-ticket idle-ticket">
                <Coffee size={44} />
                <strong>No one at the counter</strong>
              </div>
              <Button
                size="lg"
                fullWidth
                onClick={handleServeNext}
                disabled={!nextToken || busy}
              >
                <Play size={18} />
                {nextToken ? `Serve next · ${ticket(nextToken.tokenNumber)}` : 'Queue is empty'}
              </Button>
            </>
          )}

          {nextToken ? (
            <div className="next-up">
              <ArrowRight size={16} />
              <span>
                Up next: <strong>{ticket(nextToken.tokenNumber)} · {nextToken.personName}</strong>
              </span>
            </div>
          ) : null}
        </aside>

        <section className="card">
          <div className="card-header">
            <div>
              <h2>Waiting list</h2>
              <p>
                {tokens.length} {tokens.length === 1 ? 'person' : 'people'} in line · served in
                this order
              </p>
            </div>
          </div>

          <AddPerson queueId={queueId} onAdded={loadQueueData} />

          <div style={{ marginTop: 16 }}>
            {tokens.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No one is waiting"
                message="Add a person above to issue the next token."
              />
            ) : (
              <WaitingList
                tokens={tokens}
                averageServiceTime={stats.averageServiceTime}
                hasServing={Boolean(servingToken)}
                disabled={busy}
                onMoveUp={(token) => handleMove(token, 'UP')}
                onMoveDown={(token) => handleMove(token, 'DOWN')}
                onCancel={(token) => setConfirmToken(token)}
              />
            )}
          </div>
        </section>
      </div>

      <Modal
        open={Boolean(confirmToken)}
        title="Cancel this token?"
        icon={<Trash2 size={22} />}
        onClose={closeModal}
      >
        <p>
          {ticket(confirmToken?.tokenNumber)} · {confirmToken?.personName} will be removed from
          the queue. This can't be undone.
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={closeModal}>
            Keep token
          </Button>
          <Button variant="danger" onClick={handleCancel} disabled={busy}>
            Cancel token
          </Button>
        </div>
      </Modal>
    </section>
  );
}

export default QueueDetails;
