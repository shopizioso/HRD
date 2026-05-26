const STATUS_CONFIG = {
  PAID: { label: 'PAID', theme: 'success' },
  UNPAID: { label: 'UNPAID', theme: 'warning' },
  OVERDUE: { label: 'OVERDUE', theme: 'danger' },
  DRAFT: { label: 'DRAFT', theme: 'muted' },
};

export default function StatusBadge({ status = 'DRAFT', className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return <span className={`status-badge status-badge-${config.theme} ${className}`.trim()}>{config.label}</span>;
}
