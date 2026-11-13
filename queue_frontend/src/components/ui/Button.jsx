function Button({
  children,
  type = 'button',
  variant = 'primary',
  size,
  fullWidth = false,
  disabled = false,
  className = '',
  onClick,
  ...rest
}) {
  const classes = [
    'ui-btn',
    `ui-btn-${variant}`,
    size ? `ui-btn-${size}` : '',
    fullWidth ? 'ui-btn-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

export default Button;
