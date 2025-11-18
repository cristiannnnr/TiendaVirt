export function Skeleton({ height=16, width='100%', style={}, className='' }) {
  return <div className={`skeleton ${className}`.trim()} style={{ height, width, ...style }} aria-hidden="true" />;
}

export function SkeletonList({ rows=5 }) {
  return (
    <div className="skeleton-list" aria-hidden="true">
      {Array.from({ length: rows }).map((_,i)=>(
        <Skeleton key={i} height={14} style={{ marginBottom:8 }} />
      ))}
    </div>
  );
}
