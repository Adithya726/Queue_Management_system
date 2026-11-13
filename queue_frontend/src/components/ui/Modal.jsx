import { useEffect } from 'react';

function Modal({ open, title, icon, children, onClose }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="ui-modal-backdrop" onClick={onClose}>
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        {icon ? <div className="ui-modal-icon">{icon}</div> : null}
        <h3 id="modal-title">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default Modal;
