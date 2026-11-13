import { Link } from 'react-router-dom';
import { ArrowRight, ListOrdered } from 'lucide-react';
import Button from '../components/ui/Button';
import { formatDate, formatMinutes } from '../utils/format';

function QueueCard({ queue }) {
  return (
    <article className="queue-tile">
      <div className="queue-tile-head">
        <span className="queue-icon">
          <ListOrdered size={20} />
        </span>
        <div style={{ minWidth: 0 }}>
          <h3>{queue.name}</h3>
          <p>Created {formatDate(queue.createdAt) || 'just now'}</p>
        </div>
      </div>
      <div className="queue-tile-stats">
        <div>
          <strong>{queue.waitingCount ?? 0}</strong>
          <span>Waiting</span>
        </div>
        <div>
          <strong>{queue.servedCount ?? 0}</strong>
          <span>Served</span>
        </div>
        <div>
          <strong>{formatMinutes(queue.averageWaitTime)}</strong>
          <span>Avg wait</span>
        </div>
      </div>
      <Link to={`/manager/queues/${queue.id}`}>
        <Button variant="secondary" fullWidth>
          Open queue <ArrowRight size={16} />
        </Button>
      </Link>
    </article>
  );
}

export default QueueCard;
