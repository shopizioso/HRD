# 📊 Fitur Pendapatan - Dokumentasi Lengkap

## 📋 Ringkasan Fitur

Sistem manajemen pendapatan yang komprehensif untuk melacak penjualan dari berbagai channel marketplace dengan analisis real-time, chart interaktif, dan integrasi ke laporan keuangan.

## 🎯 Fitur Utama

### 1. **Input Pendapatan Harian** 📥
- **Menu**: Pendapatan → Tambah Pendapatan
- **Field Input**:
  - Tanggal transaksi
  - Pilihan channel (Shopee, Tokopedia, TikTok Shop, Lazada, Website, Lainnya)
  - Jumlah penjualan (Rp)
  - Jumlah pesanan
  - Komisi marketplace (Rp)
  - Catatan/keterangan

**Contoh Data**:
```
Tanggal: 2026-05-26
Channel: Shopee
Penjualan: 5.000.000
Pesanan: 12
Komisi: 500.000
```

### 2. **Dashboard Pendapatan** 📊
Menampilkan:
- **Total Penjualan** - Semua penjualan bulan ini
- **Total Pesanan** - Jumlah order dengan rata-rata per transaksi
- **Total Komisi** - Biaya marketplace dengan persentase
- **Pendapatan Bersih** - Setelah komisi

**Filter**:
- Berdasarkan bulan
- Berdasarkan channel marketplace
- Export ke CSV

### 3. **Ringkasan per Channel** 🛍️
Breakdown otomatis untuk setiap marketplace:
- Penjualan total
- Jumlah transaksi
- Persentase dari total
- Pesanan dan komisi

### 4. **Riwayat Transaksi** 📋
Tabel lengkap dengan:
- Tanggal transaksi
- Channel marketplace
- Penjualan, pesanan, komisi
- Pendapatan bersih
- Catatan
- Aksi: Edit & Hapus

### 5. **Chart & Grafik** 📈

#### **Trend Harian** (Tab 1)
- Bar chart menunjukkan penjualan per hari
- Summary statistik otomatis
- Rata-rata penjualan per hari
- Total order dan komisi

#### **Breakdown Marketplace** (Tab 2)
- Horizontal bar chart per channel
- Detail penjualan, order, komisi untuk setiap marketplace
- Persentase kontribusi dari total

### 6. **Laporan Pendapatan** 📊
Halaman khusus di Financial → Laporan Pendapatan dengan:
- **Summary Cards**: Total income, komisi, net income, total order
- **Interactive Charts**: Trend harian dan breakdown marketplace
- **Tabel Detail**: Perincian per channel dengan analisis
- **Insight Utama**: Channel terbaik, rata-rata harian, efisiensi komisi, AOV

## 🔧 Integrasi Backend

### Database Schema
```sql
CREATE TABLE income_records (
  id INTEGER PRIMARY KEY,
  date TEXT NOT NULL,
  marketplace TEXT NOT NULL,
  amount REAL NOT NULL,
  orders INTEGER DEFAULT 0,
  commission REAL DEFAULT 0,
  notes TEXT,
  created_by INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### API Endpoints

**Base URL**: `http://localhost:5000/api/income`

#### 1. Get All Income Records
```http
GET /api/income?startDate=2026-05-01&endDate=2026-05-31&marketplace=shopee
```

#### 2. Get Income Summary
```http
GET /api/income/summary?startDate=2026-05-01&endDate=2026-05-31
```
Response:
```json
{
  "summary": [
    {
      "marketplace": "shopee",
      "total_amount": 50000000,
      "total_commission": 5000000,
      "total_orders": 100,
      "transaction_count": 25
    }
  ],
  "totalIncome": 150000000,
  "totalCommission": 15000000,
  "netIncome": 135000000,
  "totalOrders": 300
}
```

#### 3. Create Income Record
```http
POST /api/income
Content-Type: application/json

{
  "date": "2026-05-26",
  "marketplace": "shopee",
  "amount": 5000000,
  "orders": 12,
  "commission": 500000,
  "notes": "Penjualan hari ini"
}
```

#### 4. Update Income Record
```http
PUT /api/income/:id
Content-Type: application/json

{
  "date": "2026-05-26",
  "marketplace": "shopee",
  "amount": 6000000,
  "orders": 14,
  "commission": 600000
}
```

#### 5. Delete Income Record
```http
DELETE /api/income/:id
```

#### 6. Get Daily Report
```http
GET /api/income/report/daily?month=05&year=2026
```

#### 7. Export CSV
```http
GET /api/income/export/csv?startDate=2026-05-01&endDate=2026-05-31
```

## 📱 Penggunaan Frontend

### Import Utilities

**Dengan API Backend**:
```javascript
import { 
  getIncomeEntries, 
  addIncomeEntry, 
  updateIncomeEntry, 
  deleteIncomeEntry,
  getIncomeSummary,
  exportIncomeAsCSV,
  MARKETPLACE_SOURCES
} from '../utils/incomeAPI.js';
```

**Fallback ke localStorage** (jika tidak terkoneksi ke API):
- Semua fungsi otomatis fallback ke localStorage
- Data tersimpan di browser
- Sinkronisasi otomatis saat API tersedia

### Contoh Penggunaan

```javascript
// Menambah data pendapatan
const newIncome = await addIncomeEntry({
  date: '2026-05-26',
  marketplace: 'shopee',
  amount: 5000000,
  orders: 12,
  commission: 500000,
  note: 'Penjualan pukul 10 pagi'
});

// Get semua entries
const entries = await getIncomeEntries();

// Get summary
const summary = await getIncomeSummary('2026-05-01', '2026-05-31');

// Update entry
await updateIncomeEntry(entry.id, {
  amount: 6000000,
  orders: 14
});

// Delete entry
await deleteIncomeEntry(entry.id);

// Export CSV
const csv = await exportIncomeAsCSV('2026-05-01', '2026-05-31');
```

## 🗂️ File Structure

```
src/
├── components/
│   ├── IncomeInputForm.jsx          # Form input pendapatan
│   └── IncomeCharts.jsx             # Chart visualization
│
├── pages/
│   ├── IncomePage.jsx               # Main income management page
│   └── IncomeReportPage.jsx         # Financial report page
│
├── styles/
│   ├── IncomePage.css               # Income page styles
│   ├── IncomeCharts.css             # Chart styles
│   └── IncomeReportPage.css         # Report page styles
│
└── utils/
    ├── incomeAPI.js                 # API client dengan fallback localStorage
    └── incomeManagement.js          # Legacy localStorage management

backend/
├── routes/
│   └── income.js                    # Income API endpoints
│
└── database/
    └── init.js                      # Database schema
```

## 🔄 Workflow Contoh

### Workflow 1: Input Pendapatan Harian
1. Buka menu **Pendapatan**
2. Klik **+ Tambah Pendapatan**
3. Isi form:
   - Tanggal: 26 Mei 2026
   - Channel: Shopee
   - Penjualan: 5.000.000
   - Pesanan: 12
   - Komisi: 500.000
4. Klik **💾 Simpan Data**
5. Data otomatis ditampilkan di dashboard & tabel

### Workflow 2: Analisis Laporan Keuangan
1. Buka menu **Keuangan**
2. Pilih **Laporan Pendapatan** 📥
3. Lihat summary cards (income, komisi, net income, order)
4. Pilih chart: **Trend Harian** atau **Per Marketplace**
5. Filter bulan jika diperlukan
6. Analisis insight utama

### Workflow 3: Export Data
1. Di halaman Pendapatan, ubah filter bulan
2. Klik **📥 Export CSV**
3. File `pendapatan-2026-05.csv` otomatis download
4. Buka di Excel untuk analisis lebih lanjut

## 📊 Format Data CSV

```
Tanggal,Marketplace,Penjualan,Pesanan,Komisi,Catatan
"26-May-26","Shopee","5000000","12","500000","Penjualan pagi"
"26-May-26","Tokopedia","3000000","8","300000","Promo gratis ongkir"
"25-May-26","Shopee","4500000","10","450000",""
```

## 🔐 Security & Authentication

- **Token-based Authentication**: API menggunakan Bearer token dari localStorage
- **Authorization Middleware**: Semua endpoint dilindungi middleware `authenticateToken`
- **User ID Tracking**: Setiap income record mencatat `created_by` user

## 📈 Analytics & Insights

Page Laporan Pendapatan memberikan insights:
- **Channel Terbaik**: Marketplace dengan penjualan tertinggi
- **Rata-rata Harian**: Total / 30 hari
- **Efisiensi Komisi**: (Total Komisi / Total Penjualan) × 100%
- **AOV (Average Order Value)**: Total Penjualan / Total Order

## 💾 Data Storage

### Option 1: Backend Database (Recommended)
- Persisten dan aman
- Multi-user support
- Full audit trail
- Backup otomatis

### Option 2: LocalStorage (Fallback)
- Offline capability
- Auto-sync dengan API saat online
- Max ~5-10MB per domain

## 🚀 Performance Tips

1. **Limit Data Range**: Filter bulan/year untuk queries yang lebih cepat
2. **Batch Operations**: Upload multiple entries sekaligus
3. **Export Regularly**: Download CSV untuk backup lokal
4. **Archive Old Data**: Archive data >6 bulan ke storage terpisah

## 🐛 Troubleshooting

### API Tidak Terkoneksi
- Check: Backend server running di `http://localhost:5000`
- Check: Auth token valid di localStorage
- App akan auto-fallback ke localStorage

### Chart Tidak Muncul
- Pastikan data sudah ada untuk bulan tersebut
- Refresh halaman
- Clear browser cache

### Data Hilang
- Check browser DevTools → Application → Local Storage
- Jika menggunakan API, check database
- Lihat audit logs untuk history

## 📚 Dokumentasi Terkait

- [Frontend Documentation](./FRONTEND.md)
- [Backend Documentation](./BACKEND.md)
- [Database Schema](./DATABASE.md)
- [API Reference](./API.md)

---

**Last Updated**: May 26, 2026  
**Status**: ✅ Production Ready
