import SummaryCard from '../components/SummaryCard';
import AppTable from '../components/AppTable';
import IncomeWidget from '../components/IncomeWidget';
import {
  SalaryDistributionChart,
  PayrollTrendChart,
  EmployeeStatusChart,
  TopEarningsByDeptChart,
} from '../components/DashboardCharts';

const stats = [
  { title: 'Karyawan Aktif', value: '0', helper: 'Tambah data karyawan' },
  { title: 'Penggajian Bulan Ini', value: 'Rp 0', helper: 'Tambahkan data penggajian' },
  { title: 'Invoice Tertunda', value: '0', helper: 'Belum ada invoice' },
  { title: 'Total Pendapatan', value: 'Rp 0', helper: 'Tambahkan transaksi pendapatan' },
];

const activities = [
  { id: 'INV-2034', client: 'PT Maju Bersama', amount: 'Rp 23.000.000', status: 'PAID' },
  { id: 'INV-2035', client: 'PT Sinergi', amount: 'Rp 12.500.000', status: 'UNPAID' },
  { id: 'INV-2036', client: 'Acme Corp', amount: 'Rp 8.100.000', status: 'OVERDUE' },
];

export default function DashboardPage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>HR & Finance Overview</h1>
        </div>
      </div>

      <div className="grid-columns">
        {stats.map((item) => (
          <SummaryCard key={item.title} title={item.title} value={item.value} helper={item.helper} />
        ))}
      </div>

      <IncomeWidget />

      <div className="grid-columns">
        <SalaryDistributionChart />
        <PayrollTrendChart />
      </div>

      <div className="grid-columns">
        <EmployeeStatusChart />
        <TopEarningsByDeptChart />
      </div>

      <section className="section-block">
        <div className="section-header">
          <div>
            <h2>Recent Invoices</h2>
            <p className="section-subtitle">Monitor invoice status and payments.</p>
          </div>
        </div>
        <AppTable
          columns={[
            { label: 'Invoice', key: 'id' },
            { label: 'Client', key: 'client' },
            { label: 'Amount', key: 'amount' },
            { label: 'Status', key: 'status' },
          ]}
          data={activities}
          emptyText="No activity yet"
        />
      </section>
    </div>
  );
}
