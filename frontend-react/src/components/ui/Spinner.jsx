export function Spinner({ size=24 }) {
  const style = { width:size, height:size };
  return (
    <div className="spinner" role="status" aria-label="Cargando" style={style}>
      <div className="spinner__circle" />
    </div>
  );
}
