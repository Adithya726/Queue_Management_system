import Button from '../components/ui/Button';
import { waitLabel } from '../utils/format';
import './queue.css';

function TokenCard({
  token,
  displayPosition,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onCancel,
}) {
  return (
    <article className={`token-card ${isFirst ? 'is-next' : ''}`}>
      <div className="token-badge">#{token.tokenNumber}</div>
      <div className="token-meta">
        <strong>{token.personName}</strong>
        <span>
          Position {displayPosition} · {waitLabel(token.createdAt)}
        </span>
      </div>
      <div className="token-actions">
        <Button variant="secondary" onClick={onMoveUp} disabled={isFirst}>
          Move up
        </Button>
        <Button variant="secondary" onClick={onMoveDown} disabled={isLast}>
          Move down
        </Button>
        <Button variant="danger" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </article>
  );
}

export default TokenCard;
