import { Inbox } from 'lucide-react';

function EmptyState({ title, message, action, icon: Icon = Inbox, big = false }) {
  return (
    <div className={`empty-state ${big ? 'big' : ''}`}>
      <span className="empty-icon">
        <Icon size={26} />
      </span>
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
      {action}
    </div>
  );
}

export default EmptyState;
