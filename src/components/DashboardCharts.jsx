import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#059669', '#f59e0b', '#ef4444', '#8b5cf6'];

// Salary distribution by department
const SALARY_DATA = [];

// Monthly payroll trend (last 6 months)
const MONTHLY_DATA = [];

// Employee status breakdown
const EMPLOYEE_STATUS = [];

export function SalaryDistributionChart() {
  return (
    <div className="section-block" style={{ animation: 'slideInUp 0.4s ease' }}>
      <h3 style={{ marginBottom: '20px' }}>Distribusi Gaji per Departemen</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={SALARY_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="dept" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="total" fill="#3b82f6" name="Total Gaji" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PayrollTrendChart() {
  return (
    <div className="section-block" style={{ animation: 'slideInUp 0.4s ease 0.1s both' }}>
      <h3 style={{ marginBottom: '20px' }}>Tren Penggajian 6 Bulan</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={MONTHLY_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#059669"
            strokeWidth={2}
            dot={{ fill: '#059669', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EmployeeStatusChart() {
  return (
    <div className="section-block" style={{ animation: 'slideInUp 0.4s ease 0.2s both' }}>
      <h3 style={{ marginBottom: '20px' }}>Status Karyawan</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={EMPLOYEE_STATUS}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {EMPLOYEE_STATUS.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopEarningsByDeptChart() {
  return (
    <div className="section-block" style={{ animation: 'slideInUp 0.4s ease 0.3s both' }}>
      <h3 style={{ marginBottom: '20px' }}>Pengeluaran Terbesar</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {SALARY_DATA.map((item, idx) => (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: 'var(--surface-strong)',
            borderRadius: '8px',
          }}>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{item.dept}</p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {item.employees} karyawan
              </p>
            </div>
            <p style={{ margin: 0, fontWeight: 700, color: '#3b82f6', fontSize: '1.1rem' }}>
              Rp {(item.total / 1000000).toFixed(1)}M
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
