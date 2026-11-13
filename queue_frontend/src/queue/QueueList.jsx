import QueueCard from './QueueCard';

function QueueList({ queues }) {
  return (
    <div className="queue-grid">
      {queues.map((queue) => (
        <QueueCard key={queue.id} queue={queue} />
      ))}
    </div>
  );
}

export default QueueList;
