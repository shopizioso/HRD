/**
 * PDF Export Utility untuk Income Reports
 */

export const generateIncomeReportPDF = (data) => {
  const {
    title = 'Laporan Pendapatan',
    monthYear = new Date().toISOString().slice(0, 7),
    summary = {},
    entries = [],
    companyName = 'PT Global Digital Zone'
  } = data;

  const doc = new window.jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 20, yPos);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(companyName, 20, yPos + 8);
  doc.text(`Periode: ${monthYear}`, 20, yPos + 14);
  
  yPos += 25;

  // Summary section
  if (Object.keys(summary).length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Ringkasan', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    const summaryData = [
      ['Total Penjualan', formatCurrency(summary.totalIncome)],
      ['Total Komisi', formatCurrency(summary.totalCommission)],
      ['Pendapatan Bersih', formatCurrency(summary.netIncome)],
      ['Total Pesanan', summary.totalOrders],
    ];

    summaryData.forEach((item) => {
      doc.text(`${item[0]}: ${item[1]}`, 25, yPos);
      yPos += 6;
    });
    
    yPos += 5;
  }

  // Table
  if (entries.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text('Detail Transaksi', 20, yPos);
    yPos += 8;

    const tableData = entries.slice(0, 20).map(entry => [
      entry.date,
      entry.marketplace,
      formatCurrency(entry.amount),
      entry.orders || '-',
      formatCurrency(entry.commission),
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Tanggal', 'Marketplace', 'Penjualan', 'Pesanan', 'Komisi']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234], textColor: 255, fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [240, 240, 245] },
      margin: { left: 20, right: 20 },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Laporan dibuat pada: ${new Date().toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`,
    20,
    pageHeight - 10
  );

  return doc;
};

export const downloadPDFReport = (data, filename = 'laporan-pendapatan.pdf') => {
  try {
    const doc = generateIncomeReportPDF(data);
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const generateAdvancedReportPDF = (data) => {
  const {
    title = 'Analisis Lanjutan Pendapatan',
    comparison = {},
    kpi = {},
    monthYear = new Date().toISOString().slice(0, 7),
    companyName = 'PT Global Digital Zone'
  } = data;

  const doc = new window.jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 20, yPos);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(companyName, 20, yPos + 8);
  doc.text(`Periode: ${monthYear}`, 20, yPos + 14);
  
  yPos += 30;

  // Performance section
  if (Object.keys(kpi).length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Metrik Performa', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    const kpiData = [
      [`Total Pendapatan`, formatCurrency(kpi.totalIncome)],
      [`Total Komisi`, formatCurrency(kpi.totalCommission)],
      [`Efisiensi Komisi`, `${kpi.commissionEfficiency}%`],
      [`Nilai Order Rata-rata`, formatCurrency(kpi.aov)],
      [`Conversion Rate`, kpi.conversionRate],
    ];

    kpiData.forEach((item) => {
      doc.text(`${item[0]}: ${item[1]}`, 25, yPos);
      yPos += 6;
    });
    
    yPos += 5;
  }

  // Comparison section
  if (Object.keys(comparison).length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Perbandingan Bulan', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    doc.text(`Bulan Lalu (${comparison.lastMonth}): ${formatCurrency(comparison.lastTotal)}`, 25, yPos);
    yPos += 6;
    doc.text(`Bulan Ini (${comparison.currentMonth}): ${formatCurrency(comparison.currentTotal)}`, 25, yPos);
    yPos += 6;
    doc.setTextColor(comparison.growth > 0 ? 16, 185, 129 : 220, 38, 38);
    doc.text(`Growth: ${comparison.growth > 0 ? '+' : ''}${comparison.growth.toFixed(1)}%`, 25, yPos);
  }

  // Page number
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Halaman ${i}`,
      pageWidth - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return doc;
};

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}
