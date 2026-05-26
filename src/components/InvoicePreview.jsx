import StatusBadge from './StatusBadge';

export default function InvoicePreview({ invoice }) {
  return (
    <article className="invoice-preview premium-card">
      <div className="invoice-header">
        <div>
          <p className="eyebrow">Invoice</p>
          <h2>{invoice.number}</h2>
          <p className="invoice-client">{invoice.client}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="invoice-meta-grid">
        <div>
          <p className="meta-label">Due date</p>
          <p>{invoice.dueDate}</p>
        </div>
        <div>
          <p className="meta-label">Invoice date</p>
          <p>{invoice.date}</p>
        </div>
        <div>
          <p className="meta-label">Payment method</p>
          <p>{invoice.paymentMethod}</p>
        </div>
      </div>

      <div className="invoice-table-wrapper">
        <div className="invoice-table-row invoice-table-header">
          <span>Item</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Total</span>
        </div>
        {invoice.items.map((item) => (
          <div className="invoice-table-row" key={item.name}>
            <span>{item.name}</span>
            <span>{item.qty}</span>
            <span>{item.price}</span>
            <span>{item.total}</span>
          </div>
        ))}
      </div>

      <div className="invoice-summary-grid">
        <div>
          <p className="meta-label">Notes</p>
          <p>{invoice.notes}</p>
        </div>
        <div className="invoice-grand-total">
          <p className="meta-label">Grand total</p>
          <p className="invoice-grand-total-value">{invoice.total}</p>
        </div>
      </div>
    </article>
  );
}
