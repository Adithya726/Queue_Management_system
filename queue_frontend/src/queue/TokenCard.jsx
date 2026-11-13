import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { formatMinutes, ticket, waitLabel } from '../utils/format';

function TokenCard({
  token,
  displayPosition,
  estimatedWait,
  isFirst,
  isLast,
  disabled,
  onMoveUp,
  onMoveDown,
  onCancel,
}) {
  return (
    <article className={`token-row ${isFirst ? 'is-next' : ''}`}>
      <span className="pos">{displayPosition}</span>
      <span className="ticket-chip ticket-no">{ticket(token.tokenNumber)}</span>
      <div className="token-info">
        <strong>
          {token.personName}
          {isFirst ? <span className="next-tag">Next</span> : null}
        </strong>
        <span>{waitLabel(token.createdAt)}</span>
      </div>
      <div className="eta">
        <strong>{estimatedWait > 0 ? `~${formatMinutes(estimatedWait)}` : '—'}</strong>
        est. wait
      </div>
      <div className="row-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onMoveUp}
          disabled={isFirst || disabled}
          aria-label={`Move ${token.personName} up`}
          title="Move up"
        >
          <ArrowUp size={16} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onMoveDown}
          disabled={isLast || disabled}
          aria-label={`Move ${token.personName} down`}
          title="Move down"
        >
          <ArrowDown size={16} />
        </button>
        <button
          type="button"
          className="icon-btn danger"
          onClick={onCancel}
          disabled={disabled}
          aria-label={`Cancel token for ${token.personName}`}
          title="Cancel token"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}

export default TokenCard;
