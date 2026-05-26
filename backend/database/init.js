import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'payroll.db');

let db = null;

export async function getDB() {
  if (db) return db;
  return initializeDatabase();
}

export default async function initializeDatabase() {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  // Create tables
  await db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT CHECK(role IN ('admin', 'hr', 'employee')) DEFAULT 'employee',
      department TEXT,
      position TEXT,
      google_id TEXT UNIQUE,
      microsoft_id TEXT UNIQUE,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Employees table
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      nik TEXT UNIQUE,
      nip TEXT UNIQUE,
      bank_name TEXT,
      bank_account TEXT,
      bank_account_name TEXT,
      tax_id TEXT,
      marital_status TEXT,
      number_of_children INTEGER DEFAULT 0,
      address TEXT,
      phone TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Payroll records
    CREATE TABLE IF NOT EXISTS payroll (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      basic_salary REAL NOT NULL,
      allowances REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      gross_salary REAL,
      bpjs REAL DEFAULT 0,
      pph_21 REAL DEFAULT 0,
      other_deductions REAL DEFAULT 0,
      net_salary REAL,
      status TEXT CHECK(status IN ('draft', 'approved', 'sent', 'paid')) DEFAULT 'draft',
      notes TEXT,
      created_by INTEGER,
      approved_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (approved_by) REFERENCES users(id),
      UNIQUE(employee_id, month, year)
    );

    -- Payroll slips
    CREATE TABLE IF NOT EXISTS slips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payroll_id INTEGER UNIQUE NOT NULL,
      pdf_data TEXT,
      html_template TEXT,
      sent_at TIMESTAMP,
      viewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (payroll_id) REFERENCES payroll(id) ON DELETE CASCADE
    );

    -- PDF Templates
    CREATE TABLE IF NOT EXISTS pdf_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      company_logo TEXT,
      header_text TEXT,
      footer_text TEXT,
      fields JSON,
      css_styling TEXT,
      is_default BOOLEAN DEFAULT 0,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Audit logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      changes JSON,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Backups
    CREATE TABLE IF NOT EXISTS backups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      backup_name TEXT NOT NULL,
      backup_data TEXT NOT NULL,
      backup_size INTEGER,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Encryption keys (for sensitive data)
    CREATE TABLE IF NOT EXISTS encrypted_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      field_name TEXT NOT NULL,
      encrypted_value TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- OAuth tokens
    CREATE TABLE IF NOT EXISTS oauth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      token_expiry TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, provider)
    );

    -- Income records
    CREATE TABLE IF NOT EXISTS income_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      marketplace TEXT NOT NULL CHECK(marketplace IN ('shopee', 'tokopedia', 'tiktok', 'lazada', 'website', 'other')),
      amount REAL NOT NULL,
      orders INTEGER DEFAULT 0,
      commission REAL DEFAULT 0,
      notes TEXT,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Expense records
    CREATE TABLE IF NOT EXISTS expense_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('operasional', 'gaji', 'marketing', 'shipping', 'platform_fee', 'hosting', 'lainnya')),
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);
    CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON payroll(month, year);
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_income_date ON income_records(date);
    CREATE INDEX IF NOT EXISTS idx_income_marketplace ON income_records(marketplace);
    CREATE INDEX IF NOT EXISTS idx_expense_date ON expense_records(date);
    CREATE INDEX IF NOT EXISTS idx_expense_category ON expense_records(category);
  `);

  console.log('✅ Database initialized successfully');
  return db;
}
