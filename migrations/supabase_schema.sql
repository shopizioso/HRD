-- Supabase (Postgres) schema for HRD Payroll

-- employees
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  position text,
  department text,
  salary numeric,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- payrolls
CREATE TABLE IF NOT EXISTS payrolls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  period text,
  salary numeric,
  allowance numeric,
  bonus numeric,
  overtime numeric,
  deduction numeric,
  total numeric,
  created_at timestamptz DEFAULT now()
);

-- invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text,
  client_name text,
  amount numeric,
  status text,
  due_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text,
  category text,
  amount numeric,
  description text,
  source text,
  transaction_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- finance_categories
CREATE TABLE IF NOT EXISTS finance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  type text,
  created_at timestamptz DEFAULT now()
);

-- company_settings
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text,
  logo text,
  email text,
  phone text,
  address text,
  npwp text,
  director_name text,
  created_at timestamptz DEFAULT now()
);

-- banks
CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text,
  account_name text,
  account_number text,
  opening_balance numeric,
  created_at timestamptz DEFAULT now()
);

-- liabilities
CREATE TABLE IF NOT EXISTS liabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  amount numeric,
  due_date date,
  status text,
  created_at timestamptz DEFAULT now()
);

-- profiles (per-user preferences)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email text,
  avatar text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
