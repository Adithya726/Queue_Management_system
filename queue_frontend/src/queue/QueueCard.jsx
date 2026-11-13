import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { formatMinutes } from '../utils/format';
import './queue.css';

function QueueCard({ queue }) {
  const createdAt = queue.createdAt
    ? new Date(queue.createdAt).toLocaleString()
    : 'Just created';

  return (
    <article className="queue-card">
      <div className="queue-card-top">
        <h3>{queue.name}</h3>
        <span className="queue-chip">{queue.waitingCount ?? 0} waiting</span>
      </div>
      <p className="queue-card-meta">Created {createdAt}</p>
      {typeof queue.averageWaitTime === 'number' ? (
        <p className="queue-card-meta">Avg wait {formatMinutes(queue.averageWaitTime)}</p>
      ) : null}
      <Link to={`/manager/queues/${queue.id}`}>
        <Button fullWidth>Open queue</Button>
      </Link>
    </article>
  );
}

export default QueueCard;
