export function Button({ variant='primary', children, className='', disabled=false, ...rest }) {
  const base = 'btn';
  return (
    <button
      className={`${base} ${base}--${variant} ${disabled?'is-disabled':''} ${className}`.trim()}
      disabled={disabled}
      {...rest}
    >{children}</button>
  );
}
