import StatusBadge from './StatusBadge';

export default function InvoiceCard({ invoice, onView }) {
  return (
    <article className="invoice-card" onClick={() => onView?.(invoice)}>
      <div className="invoice-card-meta">
        <div>
          <p className="invoice-card-name">{invoice.client}</p>
          <p className="invoice-card-subtitle">Due {invoice.dueDate}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>
      <div className="invoice-card-footer">
        <div>{invoice.number}</div>
        <div className="invoice-card-total">{invoice.total}</div>
      </div>
    </article>
  );
}
