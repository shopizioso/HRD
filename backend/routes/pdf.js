import express from 'express';
import { getDB } from '../database/init.js';
import { requirePermission } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';
import jsPDF from 'jspdf';

const router = express.Router();

// Get PDF templates
router.get('/templates', requirePermission('view_payroll'), async (req, res) => {
  try {
    const db = await getDB();
    const templates = await db.all('SELECT * FROM pdf_templates WHERE is_active = 1 OR created_by = ?', [req.user.id]);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create PDF template
router.post('/templates', requirePermission('manage_payroll'), async (req, res) => {
  try {
    const { name, description, fields, css_styling } = req.body;
    const db = await getDB();

    const result = await db.run(
      `INSERT INTO pdf_templates (name, description, fields, css_styling, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, JSON.stringify(fields), css_styling, req.user.id]
    );

    await logAudit(req.user.id, 'PDF_TEMPLATE_CREATED', 'pdf_template', result.lastID);

    res.status(201).json({
      id: result.lastID,
      name,
      description,
      fields
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Generate PDF slip
router.post('/generate', requirePermission('view_payroll'), async (req, res) => {
  try {
    const { payroll_id, template_id, data } = req.body;

    // Create PDF using jsPDF
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(16);
    doc.text('PT GDZ SaaS', 20, 20);
    
    // Add slip details
    doc.setFontSize(12);
    let yPosition = 40;
    
    Object.entries(data).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 20, yPosition);
      yPosition += 10;
    });

    // Generate PDF as base64
    const pdfData = doc.output('datauristring');

    // Save to database
    const db = await getDB();
    await db.run(
      `INSERT INTO slips (payroll_id, pdf_data) VALUES (?, ?)`,
      [payroll_id, pdfData]
    );

    await logAudit(req.user.id, 'PDF_GENERATED', 'slip', payroll_id);

    res.json({
      success: true,
      pdfUrl: pdfData,
      message: 'PDF generated successfully'
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Download PDF
router.get('/download/:id', requirePermission('view_payroll'), async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    const slip = await db.get('SELECT pdf_data FROM slips WHERE id = ?', [id]);
    if (!slip) {
      return res.status(404).json({ error: 'Slip not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(slip.pdf_data.split(',')[1], 'base64'));
  } catch (error) {
    res.status(500).json({ error: 'Failed to download PDF' });
  }
});

export default router;
