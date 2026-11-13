import TokenCard from './TokenCard';

function WaitingList({ tokens, averageServiceTime, hasServing, disabled, onMoveUp, onMoveDown, onCancel }) {
  return (
    <div className="wl">
      {tokens.map((token, index) => {
        const ahead = index + (hasServing ? 1 : 0);
        return (
          <TokenCard
            key={token.id}
            token={token}
            displayPosition={index + 1}
            estimatedWait={ahead * (averageServiceTime || 0)}
            isFirst={index === 0}
            isLast={index === tokens.length - 1}
            disabled={disabled}
            onMoveUp={() => onMoveUp(token)}
            onMoveDown={() => onMoveDown(token)}
            onCancel={() => onCancel(token)}
          />
        );
      })}
    </div>
  );
}

export default WaitingList;
