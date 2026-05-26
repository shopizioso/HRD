export default function SummaryCard({ title, value, helper, icon, badge, className = '' }) {
  return (
    <article className={`summary-card ${className}`.trim()}>
      <div className="summary-card-top">
        <div>
          <p className="summary-card-title">{title}</p>
          <h3 className="summary-card-value">{value}</h3>
        </div>
        {icon && <div className="summary-card-icon">{icon}</div>}
      </div>
      <div className="summary-card-meta">
        {badge}
        {helper && <p className="summary-card-helper">{helper}</p>}
      </div>
    </article>
  );
}
