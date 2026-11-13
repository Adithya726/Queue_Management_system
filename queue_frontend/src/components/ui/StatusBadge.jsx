const LABELS = {
  WAITING: 'Waiting',
  SERVING: 'Serving',
  SERVED: 'Served',
  CANCELLED: 'Cancelled',
};

function StatusBadge({ status, label }) {
  const key = String(status || '').toLowerCase();
  return <span className={`badge badge-${key}`}>{label || LABELS[status] || status}</span>;
}

export default StatusBadge;
