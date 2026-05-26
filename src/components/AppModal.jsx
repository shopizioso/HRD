export default function AppModal({ open, title, children, onClose, className = '' }) {
  if (!open) return null;
  return (
    <div className={`app-modal-backdrop ${className}`.trim()} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="app-modal-panel" role="dialog" aria-modal="true">
        <div className="app-modal-header">
          <h3>{title}</h3>
          <button type="button" className="app-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="app-modal-content">{children}</div>
      </div>
    </div>
  );
}
