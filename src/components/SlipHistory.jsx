import { useState } from 'react';
import { Download, Eye } from 'lucide-react';

const SLIP_HISTORY = [
  { id: 'SL-202605-001', period: 'Mei 2026', date: '2026-05-25', status: 'paid', gross: 3000000 },
  { id: 'SL-202604-001', period: 'April 2026', date: '2026-04-25', status: 'paid', gross: 2900000 },
  { id: 'SL-202603-001', period: 'Maret 2026', date: '2026-03-25', status: 'paid', gross: 2800000 },
  { id: 'SL-202602-001', period: 'Februari 2026', date: '2026-02-25', status: 'paid', gross: 2750000 },
  { id: 'SL-202601-001', period: 'Januari 2026', date: '2026-01-25', status: 'paid', gross: 2850000 },
  { id: 'SL-202512-001', period: 'Desember 2025', date: '2025-12-25', status: 'paid', gross: 2950000 },
];

export function SlipHistory({ employeeId, onViewSlip }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="section-block" style={{ animation: 'slideInUp 0.4s ease' }}>
      <div className="section-header">
        <div>
          <h3>Slip Gaji - Riwayat</h3>
          <p className="section-subtitle">Lihat dan download slip gaji bulan-bulan sebelumnya</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {SLIP_HISTORY.map((slip) => (
          <div
            key={slip.id}
            onClick={() => setExpandedId(expandedId === slip.id ? null : slip.id)}
            style={{
              padding: '16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              backgroundColor: expandedId === slip.id ? 'var(--surface-strong)' : 'transparent',
              transition: 'background-color 0.2s, transform 0.2s',
              transform: expandedId === slip.id ? 'scale(1.01)' : 'scale(1)',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700 }}>
                  {slip.period}
                </p>
                <p style={{
                  margin: '0',
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                }}>
                  Slip {slip.id} • {new Date(slip.date).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: 'rgba(5, 150, 105, 0.1)',
                  color: 'var(--success)',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  {slip.status === 'paid' ? '✓ Terkirim' : 'Pending'}
                </span>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  minWidth: '120px',
                  textAlign: 'right',
                }}>
                  Rp {(slip.gross / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>

            {expandedId === slip.id && (
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '12px',
                animation: 'slideInDown 0.2s ease',
              }}>
                <button
                  className="app-button app-button-primary app-button-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewSlip?.(slip.id);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={16} />
                  Lihat Detail
                </button>
                <button
                  className="app-button app-button-secondary app-button-sm"
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
