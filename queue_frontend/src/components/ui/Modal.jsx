function Modal({ open, title, children, onClose }) {
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
        <div className="ui-modal-header">
          <h3 id="modal-title">{title}</h3>
          <button type="button" className="ui-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
