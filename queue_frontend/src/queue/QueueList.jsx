import QueueCard from './QueueCard';
import './queue.css';

function QueueList({ queues }) {
  return (
    <div className="queue-list">
      {queues.map((queue) => (
        <QueueCard key={queue.id} queue={queue} />
      ))}
    </div>
  );
}

export default QueueList;
