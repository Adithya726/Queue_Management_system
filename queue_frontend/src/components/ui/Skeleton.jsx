export function Skeleton({ height = 16, width = '100%', style }) {
  return <div className="skeleton" style={{ height, width, ...style }} />;
}

export function PageSkeleton() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading">
      <Skeleton height={56} width="40%" />
      <div className="skeleton-row">
        <Skeleton height={112} />
        <Skeleton height={112} />
        <Skeleton height={112} />
        <Skeleton height={112} />
      </div>
      <Skeleton height={320} />
    </div>
  );
}

export default Skeleton;
