function Button({
  children,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  className = '',
  onClick,
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn-${variant} ${fullWidth ? 'ui-btn-full' : ''} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
