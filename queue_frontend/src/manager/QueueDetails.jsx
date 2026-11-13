import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AddPerson from '../queue/AddPerson';
import WaitingList from '../queue/WaitingList';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/common/EmptyState';
import { getMyQueues } from '../services/queueService';
import { getQueueAnalytics } from '../services/analyticsService';
import {
  cancelToken,
  clearServingToken,
  completeToken,
  getQueueTokens,
  getServingTokens,
  moveToken,
  saveServingToken,
  serveNextToken,
  splitQueueTokens,
} from '../services/tokenService';
import { getErrorMessage } from '../services/api';
import { formatMinutes, startedLabel, waitLabel } from '../utils/format';
import './manager.css';
import '../queue/queue.css';

function QueueDetails() {
  const { queueId } = useParams();
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [servingToken, setServingToken] = useState(null);
  const [averageWaitTime, setAverageWaitTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmToken, setConfirmToken] = useState(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const loadQueueData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError('');

    try {
      const queuesResponse = await getMyQueues();
      const currentQueue = (queuesResponse.data || []).find(
        (item) => String(item.id) === String(queueId)
      );

      if (!currentQueue) {
        setQueue(null);
        setTokens([]);
        setServingToken(null);
        return;
      }

      const [tokensResponse, analyticsResponse] = await Promise.all([
        getQueueTokens(queueId),
        getQueueAnalytics(queueId).catch(() => null),
      ]);

      const { waiting, serving } = splitQueueTokens(tokensResponse.data || []);
      setQueue(currentQueue);
      setTokens(waiting);
      setServingToken(serving || getServingTokens()[String(queueId)] || null);
      setAverageWaitTime(analyticsResponse?.data?.averageWaitTime || 0);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load this queue.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueueData(true);
  }, [queueId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleMove = async (tokenId, direction) => {
    setError('');
    setSuccess('');
    try {
      await moveToken(tokenId, direction);
      await loadQueueData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to move this token.'));
    }
  };

  const handleServeNext = async () => {
    if (tokens.length === 0 || busy) {
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      const response = await serveNextToken(queueId);
      saveServingToken(queueId, response.data);
      setServingToken(response.data);
      setSuccess(`Now serving token #${response.data.tokenNumber}.`);
      await loadQueueData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to assign the next token for service.'));
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = async () => {
    if (!servingToken) {
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await completeToken(servingToken.id);
      clearServingToken(queueId);
      setServingToken(null);
      setSuccess(`Token #${servingToken.tokenNumber} finished service.`);
      await loadQueueData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to complete this token.'));
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!confirmToken) {
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await cancelToken(confirmToken.id);
      setSuccess(`Token #${confirmToken.tokenNumber} was cancelled.`);
      setConfirmToken(null);
      await loadQueueData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to cancel this token.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Loader label="Loading queue details..." />;
  }

  if (!queue) {
    return (
      <EmptyState
        title="Queue not found"
        message="This queue does not belong to the logged-in manager."
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
      <div className="page-header">
        <div>
          <p className="eyebrow">Queue</p>
          <h1 className="page-title">{queue.name}</h1>
          <p className="page-subtitle">
            {tokens.length} waiting · avg wait {formatMinutes(averageWaitTime)}
          </p>
        </div>
        <div className="queue-toolbar">
          <Link to="/manager/queues">
            <Button variant="ghost">All queues</Button>
          </Link>
          <Link to={`/manager/analytics/${queueId}`}>
            <Button variant="secondary">Analytics</Button>
          </Link>
        </div>
      </div>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="queue-ops-grid">
        <article className={`serving-card ${servingToken ? 'is-active' : ''}`}>
          <span>Now serving</span>
          {servingToken ? (
            <>
              <strong>
                #{servingToken.tokenNumber} · {servingToken.personName}
              </strong>
              <p>{startedLabel(servingToken.servingStartedAt)}</p>
              <Button variant="success" onClick={handleComplete} disabled={busy}>
                {busy ? 'Please wait...' : 'Complete service'}
              </Button>
            </>
          ) : (
            <>
              <strong>No token at the counter</strong>
              <p>Assign the person at the top of the waiting list with one click.</p>
              <Button onClick={handleServeNext} disabled={tokens.length === 0 || busy}>
                Serve next token
              </Button>
            </>
          )}
        </article>

        <article className="next-card">
          <span>Next in line</span>
          {nextToken ? (
            <>
              <strong>
                #{nextToken.tokenNumber} · {nextToken.personName}
              </strong>
              <p>
                {waitLabel(nextToken.createdAt)} · position 1
              </p>
              {servingToken ? (
                <p className="hint">Complete the current token, then serve this person.</p>
              ) : (
                <Button onClick={handleServeNext} disabled={busy}>
                  Assign for service
                </Button>
              )}
            </>
          ) : (
            <>
              <strong>Waiting list is empty</strong>
              <p>Add a person to generate a token.</p>
            </>
          )}
        </article>
      </div>

      <AddPerson queueId={queueId} onAdded={() => loadQueueData(false)} />

      {tokens.length === 0 ? (
        <EmptyState
          title="No waiting customers"
          message="Add a person to generate the next token number."
        />
      ) : (
        <WaitingList
          key={now}
          tokens={tokens}
          onMoveUp={(token) => handleMove(token.id, 'UP')}
          onMoveDown={(token) => handleMove(token.id, 'DOWN')}
          onCancel={(token) => setConfirmToken(token)}
        />
      )}

      <Modal
        open={Boolean(confirmToken)}
        title="Cancel token"
        onClose={() => setConfirmToken(null)}
      >
        <p>
          Cancel token #{confirmToken?.tokenNumber} for {confirmToken?.personName}? They
          will be removed from this queue.
        </p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setConfirmToken(null)}>
            Keep token
          </Button>
          <Button variant="danger" onClick={handleCancel} disabled={busy}>
            {busy ? 'Cancelling...' : 'Cancel token'}
          </Button>
        </div>
      </Modal>
    </section>
  );
}

export default QueueDetails;
