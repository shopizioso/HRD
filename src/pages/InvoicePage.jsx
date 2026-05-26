import InvoiceCard from '../components/InvoiceCard';
import InvoicePreview from '../components/InvoicePreview';
import { useState } from 'react';

const INVOICES = [
  {
    id: 'INV-2034',
    number: 'INV-2034',
    client: 'PT Maju Bersama',
    status: 'PAID',
    dueDate: '20 Mei 2026',
    date: '05 Mei 2026',
    paymentMethod: 'Bank Transfer',
    items: [
      { name: 'Payroll Service', qty: 1, price: 'Rp 12.000.000', total: 'Rp 12.000.000' },
      { name: 'Invoice Management', qty: 1, price: 'Rp 4.500.000', total: 'Rp 4.500.000' },
    ],
    total: 'Rp 16.500.000',
    notes: 'Pembayaran jatuh tempo dalam 14 hari kerja.',
  },
  {
    id: 'INV-2035',
    number: 'INV-2035',
    client: 'PT Sinergi',
    status: 'UNPAID',
    dueDate: '27 Mei 2026',
    date: '10 Mei 2026',
    paymentMethod: 'e-Wallet',
    items: [
      { name: 'Payroll Setup', qty: 1, price: 'Rp 10.000.000', total: 'Rp 10.000.000' },
    ],
    total: 'Rp 10.000.000',
    notes: 'Tolong lunasi sebelum jatuh tempo.',
  },
];

export default function InvoicePage() {
  const [activeInvoice, setActiveInvoice] = useState(INVOICES[0]);
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Invoice</p>
          <h1>Billing & invoices</h1>
        </div>
      </div>

      <div className="grid-columns grid-columns-2">
        <div className="section-block">
          <div className="section-header">
            <div>
              <h2>Recent invoices</h2>
              <p className="section-subtitle">Select an invoice to review the details.</p>
            </div>
          </div>
          <div className="invoice-list">
            {INVOICES.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} onView={setActiveInvoice} />
            ))}
          </div>
        </div>

        <section className="section-block">
          <InvoicePreview invoice={activeInvoice} />
        </section>
      </div>
    </div>
  );
}
