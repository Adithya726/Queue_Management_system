import TokenCard from './TokenCard';
import './queue.css';

function WaitingList({ tokens, onMoveUp, onMoveDown, onCancel }) {
  return (
    <div className="waiting-panel">
      <div className="waiting-panel-header">
        <h2>Waiting list</h2>
        <span>{tokens.length} token{tokens.length === 1 ? '' : 's'}</span>
      </div>
      <div className="waiting-list">
        {tokens.map((token, index) => (
          <TokenCard
            key={token.id}
            token={token}
            displayPosition={index + 1}
            isFirst={index === 0}
            isLast={index === tokens.length - 1}
            onMoveUp={() => onMoveUp(token)}
            onMoveDown={() => onMoveDown(token)}
            onCancel={() => onCancel(token)}
          />
        ))}
      </div>
    </div>
  );
}

export default WaitingList;
