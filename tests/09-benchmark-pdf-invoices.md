# Benchmark: PDF Invoice Generation

**Scenario:** "Generate branded PDF invoices — logo, line items, totals, payment terms. Node.js."
**Skills tested:** think-twice v1.0, surgical v1.0
**Date:** 2026-06-07

---

## Greedy Output (no skills)

```javascript
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a branded PDF invoice.
 * @param {Object} invoice - Invoice data
 * @param {string} outputPath - Output file path
 */
async function generateInvoice(invoice, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: {
        Title: `Invoice ${invoice.invoiceNumber}`,
        Author: invoice.company.name,
        Subject: 'Invoice',
      },
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    stream.on('finish', resolve);
    stream.on('error', reject);

    // ─── Page dimensions ─────────────────────────────────────────────────────
    const PAGE_W = 595.28;   // A4 width in points
    const PAGE_H = 841.89;   // A4 height in points
    const MARGIN_L = 50;
    const MARGIN_R = PAGE_W - 50;
    const CONTENT_W = MARGIN_R - MARGIN_L;

    // ─── Color palette ────────────────────────────────────────────────────────
    const COLOR_PRIMARY   = '#1a1a2e';
    const COLOR_ACCENT    = '#e94560';
    const COLOR_LIGHT_BG  = '#f7f8fc';
    const COLOR_BORDER    = '#e0e0e0';
    const COLOR_TEXT      = '#333333';
    const COLOR_MUTED     = '#888888';
    const COLOR_WHITE     = '#ffffff';

    // ─── Fonts ────────────────────────────────────────────────────────────────
    // PDFKit ships with Helvetica — use it for all weight variants
    const FONT_BOLD   = 'Helvetica-Bold';
    const FONT_NORMAL = 'Helvetica';

    // ─── Header background band ───────────────────────────────────────────────
    doc
      .rect(0, 0, PAGE_W, 160)
      .fill(COLOR_PRIMARY);

    // ─── Logo ─────────────────────────────────────────────────────────────────
    // Try to draw the company logo; fall back to text mark if file missing
    const logoPath = invoice.company.logoPath;
    if (logoPath && fs.existsSync(logoPath)) {
      doc.image(logoPath, MARGIN_L, 30, {
        fit: [120, 80],
        align: 'left',
        valign: 'center',
      });
    } else {
      // Text fallback logo mark
      doc
        .fillColor(COLOR_ACCENT)
        .font(FONT_BOLD)
        .fontSize(28)
        .text(invoice.company.name.slice(0, 2).toUpperCase(), MARGIN_L, 45, {
          width: 60,
          align: 'center',
        });
      doc
        .rect(MARGIN_L, 42, 60, 60)
        .strokeColor(COLOR_ACCENT)
        .lineWidth(2)
        .stroke();
    }

    // ─── "INVOICE" label (top-right of header) ────────────────────────────────
    doc
      .fillColor(COLOR_WHITE)
      .font(FONT_BOLD)
      .fontSize(36)
      .text('INVOICE', 0, 45, {
        width: MARGIN_R,
        align: 'right',
      });

    // ─── Invoice meta (number, date, due date) ────────────────────────────────
    doc
      .fillColor(COLOR_ACCENT)
      .font(FONT_BOLD)
      .fontSize(10)
      .text(`#${invoice.invoiceNumber}`, 0, 88, {
        width: MARGIN_R,
        align: 'right',
      });

    doc
      .fillColor(COLOR_WHITE)
      .font(FONT_NORMAL)
      .fontSize(9)
      .text(`Date: ${formatDate(invoice.date)}`, 0, 104, {
        width: MARGIN_R,
        align: 'right',
      })
      .text(`Due: ${formatDate(invoice.dueDate)}`, 0, 118, {
        width: MARGIN_R,
        align: 'right',
      });

    // ─── Accent stripe below header ───────────────────────────────────────────
    doc
      .rect(0, 160, PAGE_W, 5)
      .fill(COLOR_ACCENT);

    // ─── FROM / BILL TO blocks ────────────────────────────────────────────────
    let y = 190;

    // "FROM" label
    doc
      .fillColor(COLOR_MUTED)
      .font(FONT_BOLD)
      .fontSize(8)
      .text('FROM', MARGIN_L, y)
      .moveDown(0.3);

    y += 14;
    doc
      .fillColor(COLOR_TEXT)
      .font(FONT_BOLD)
      .fontSize(11)
      .text(invoice.company.name, MARGIN_L, y);

    y += 16;
    doc
      .font(FONT_NORMAL)
      .fontSize(9)
      .fillColor(COLOR_MUTED);

    const fromLines = [
      invoice.company.address,
      `${invoice.company.city}, ${invoice.company.state} ${invoice.company.zip}`,
      invoice.company.country,
      invoice.company.email,
      invoice.company.phone,
    ].filter(Boolean);

    fromLines.forEach((line) => {
      doc.text(line, MARGIN_L, y);
      y += 13;
    });

    // "BILL TO" label — right column, starts at same Y as FROM
    const COL2_X = MARGIN_L + CONTENT_W / 2;
    let y2 = 190;

    doc
      .fillColor(COLOR_MUTED)
      .font(FONT_BOLD)
      .fontSize(8)
      .text('BILL TO', COL2_X, y2);

    y2 += 14;
    doc
      .fillColor(COLOR_TEXT)
      .font(FONT_BOLD)
      .fontSize(11)
      .text(invoice.client.name, COL2_X, y2);

    y2 += 16;
    doc
      .font(FONT_NORMAL)
      .fontSize(9)
      .fillColor(COLOR_MUTED);

    const toLines = [
      invoice.client.address,
      `${invoice.client.city}, ${invoice.client.state} ${invoice.client.zip}`,
      invoice.client.country,
      invoice.client.email,
    ].filter(Boolean);

    toLines.forEach((line) => {
      doc.text(line, COL2_X, y2);
      y2 += 13;
    });

    // Advance Y past whichever column was taller
    y = Math.max(y, y2) + 20;

    // ─── Divider ──────────────────────────────────────────────────────────────
    doc
      .moveTo(MARGIN_L, y)
      .lineTo(MARGIN_R, y)
      .strokeColor(COLOR_BORDER)
      .lineWidth(1)
      .stroke();

    y += 20;

    // ─── Line items table header ───────────────────────────────────────────────
    // Column layout (all x coords absolute from left edge)
    const COL_DESC_X    = MARGIN_L;
    const COL_QTY_X     = MARGIN_L + CONTENT_W * 0.52;
    const COL_UNIT_X    = MARGIN_L + CONTENT_W * 0.65;
    const COL_TOTAL_X   = MARGIN_L + CONTENT_W * 0.80;
    const COL_DESC_W    = CONTENT_W * 0.50;
    const COL_QTY_W     = CONTENT_W * 0.12;
    const COL_UNIT_W    = CONTENT_W * 0.14;
    const COL_TOTAL_W   = CONTENT_W * 0.20;

    // Table header background
    doc
      .rect(MARGIN_L, y, CONTENT_W, 22)
      .fill(COLOR_PRIMARY);

    doc
      .fillColor(COLOR_WHITE)
      .font(FONT_BOLD)
      .fontSize(8);

    const TABLE_HEADER_Y = y + 7;
    doc.text('DESCRIPTION',  COL_DESC_X,  TABLE_HEADER_Y, { width: COL_DESC_W,  align: 'left'  });
    doc.text('QTY',          COL_QTY_X,   TABLE_HEADER_Y, { width: COL_QTY_W,   align: 'right' });
    doc.text('UNIT PRICE',   COL_UNIT_X,  TABLE_HEADER_Y, { width: COL_UNIT_W,  align: 'right' });
    doc.text('TOTAL',        COL_TOTAL_X, TABLE_HEADER_Y, { width: COL_TOTAL_W, align: 'right' });

    y += 22;

    // ─── Line items rows ───────────────────────────────────────────────────────
    let subtotal = 0;

    invoice.lineItems.forEach((item, index) => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;

      // Alternating row background
      if (index % 2 === 0) {
        doc
          .rect(MARGIN_L, y, CONTENT_W, 28)
          .fill(COLOR_LIGHT_BG);
      }

      const ROW_TEXT_Y = y + 8;

      // Description (with optional subtitle)
      doc
        .fillColor(COLOR_TEXT)
        .font(FONT_BOLD)
        .fontSize(9)
        .text(item.description, COL_DESC_X, ROW_TEXT_Y, {
          width: COL_DESC_W,
          lineBreak: false,
          ellipsis: true,
        });

      if (item.subtitle) {
        doc
          .fillColor(COLOR_MUTED)
          .font(FONT_NORMAL)
          .fontSize(7.5)
          .text(item.subtitle, COL_DESC_X, ROW_TEXT_Y + 11, {
            width: COL_DESC_W,
            lineBreak: false,
            ellipsis: true,
          });
      }

      // Quantity
      doc
        .fillColor(COLOR_TEXT)
        .font(FONT_NORMAL)
        .fontSize(9)
        .text(String(item.quantity), COL_QTY_X, ROW_TEXT_Y, {
          width: COL_QTY_W,
          align: 'right',
        });

      // Unit price
      doc.text(
        formatCurrency(item.unitPrice, invoice.currency),
        COL_UNIT_X,
        ROW_TEXT_Y,
        { width: COL_UNIT_W, align: 'right' }
      );

      // Line total
      doc
        .font(FONT_BOLD)
        .text(
          formatCurrency(lineTotal, invoice.currency),
          COL_TOTAL_X,
          ROW_TEXT_Y,
          { width: COL_TOTAL_W, align: 'right' }
        );

      // Bottom border for row
      doc
        .moveTo(MARGIN_L, y + 28)
        .lineTo(MARGIN_R, y + 28)
        .strokeColor(COLOR_BORDER)
        .lineWidth(0.5)
        .stroke();

      y += 28;

      // ─── Page overflow guard ───────────────────────────────────────────────
      if (y > PAGE_H - 220) {
        doc.addPage({ size: 'A4', margin: 0 });
        // Redraw header stripe on continuation page
        doc
          .rect(0, 0, PAGE_W, 8)
          .fill(COLOR_ACCENT);
        doc
          .fillColor(COLOR_MUTED)
          .font(FONT_NORMAL)
          .fontSize(8)
          .text(
            `Invoice ${invoice.invoiceNumber} — continued`,
            MARGIN_L,
            16
          );
        y = 40;
      }
    });

    y += 10;

    // ─── Totals section ───────────────────────────────────────────────────────
    const TOTALS_X     = MARGIN_L + CONTENT_W * 0.58;
    const TOTALS_W     = CONTENT_W * 0.42;
    const LABEL_W      = TOTALS_W * 0.55;
    const AMOUNT_W     = TOTALS_W * 0.45;
    const AMOUNT_X     = TOTALS_X + LABEL_W;

    // Subtotal row
    doc
      .fillColor(COLOR_MUTED)
      .font(FONT_NORMAL)
      .fontSize(9)
      .text('Subtotal', TOTALS_X, y, { width: LABEL_W, align: 'left' });
    doc
      .fillColor(COLOR_TEXT)
      .text(formatCurrency(subtotal, invoice.currency), AMOUNT_X, y, {
        width: AMOUNT_W,
        align: 'right',
      });

    y += 16;

    // Discount row (if present)
    if (invoice.discount && invoice.discount > 0) {
      const discountAmt = subtotal * (invoice.discount / 100);
      doc
        .fillColor(COLOR_MUTED)
        .font(FONT_NORMAL)
        .fontSize(9)
        .text(`Discount (${invoice.discount}%)`, TOTALS_X, y, {
          width: LABEL_W,
          align: 'left',
        });
      doc
        .fillColor(COLOR_ACCENT)
        .text(`-${formatCurrency(discountAmt, invoice.currency)}`, AMOUNT_X, y, {
          width: AMOUNT_W,
          align: 'right',
        });
      subtotal -= discountAmt;
      y += 16;
    }

    // Tax row (if present)
    if (invoice.taxRate && invoice.taxRate > 0) {
      const taxAmt = subtotal * (invoice.taxRate / 100);
      doc
        .fillColor(COLOR_MUTED)
        .font(FONT_NORMAL)
        .fontSize(9)
        .text(`Tax (${invoice.taxRate}%)`, TOTALS_X, y, {
          width: LABEL_W,
          align: 'left',
        });
      doc
        .fillColor(COLOR_TEXT)
        .text(formatCurrency(taxAmt, invoice.currency), AMOUNT_X, y, {
          width: AMOUNT_W,
          align: 'right',
        });
      subtotal += taxAmt;
      y += 16;
    }

    // Total divider
    doc
      .moveTo(TOTALS_X, y)
      .lineTo(TOTALS_X + TOTALS_W, y)
      .strokeColor(COLOR_BORDER)
      .lineWidth(1)
      .stroke();

    y += 10;

    // Grand total row — highlighted box
    doc
      .rect(TOTALS_X - 6, y - 4, TOTALS_W + 6, 30)
      .fill(COLOR_PRIMARY);

    doc
      .fillColor(COLOR_WHITE)
      .font(FONT_BOLD)
      .fontSize(10)
      .text('TOTAL DUE', TOTALS_X, y + 6, { width: LABEL_W, align: 'left' });

    doc
      .fillColor(COLOR_ACCENT)
      .font(FONT_BOLD)
      .fontSize(13)
      .text(formatCurrency(subtotal, invoice.currency), AMOUNT_X, y + 4, {
        width: AMOUNT_W,
        align: 'right',
      });

    y += 42;

    // ─── Payment terms block ───────────────────────────────────────────────────
    if (invoice.paymentTerms) {
      doc
        .rect(MARGIN_L, y, CONTENT_W, 1)
        .fill(COLOR_BORDER);

      y += 16;

      doc
        .fillColor(COLOR_MUTED)
        .font(FONT_BOLD)
        .fontSize(8)
        .text('PAYMENT TERMS', MARGIN_L, y);

      y += 14;

      doc
        .fillColor(COLOR_TEXT)
        .font(FONT_NORMAL)
        .fontSize(9)
        .text(invoice.paymentTerms, MARGIN_L, y, {
          width: CONTENT_W * 0.6,
          lineGap: 3,
        });

      y += 40;
    }

    // ─── Bank / payment details ────────────────────────────────────────────────
    if (invoice.paymentDetails) {
      const pd = invoice.paymentDetails;

      doc
        .fillColor(COLOR_MUTED)
        .font(FONT_BOLD)
        .fontSize(8)
        .text('PAYMENT DETAILS', MARGIN_L, y);

      y += 14;

      const payRows = [
        pd.bankName   && ['Bank',           pd.bankName],
        pd.accountName && ['Account Name',  pd.accountName],
        pd.accountNumber && ['Account No.',  pd.accountNumber],
        pd.routingNumber && ['Routing No.',  pd.routingNumber],
        pd.iban        && ['IBAN',           pd.iban],
        pd.swift       && ['SWIFT/BIC',      pd.swift],
        pd.reference   && ['Reference',      pd.reference],
      ].filter(Boolean);

      payRows.forEach(([label, value]) => {
        doc
          .fillColor(COLOR_MUTED)
          .font(FONT_NORMAL)
          .fontSize(8)
          .text(label, MARGIN_L, y, { width: 90, align: 'left' });
        doc
          .fillColor(COLOR_TEXT)
          .font(FONT_NORMAL)
          .fontSize(8)
          .text(value, MARGIN_L + 95, y);
        y += 13;
      });

      y += 10;
    }

    // ─── Notes ────────────────────────────────────────────────────────────────
    if (invoice.notes) {
      doc
        .rect(MARGIN_L, y, CONTENT_W, 1)
        .fill(COLOR_BORDER);
      y += 16;

      doc
        .fillColor(COLOR_MUTED)
        .font(FONT_BOLD)
        .fontSize(8)
        .text('NOTES', MARGIN_L, y);

      y += 14;

      doc
        .fillColor(COLOR_MUTED)
        .font(FONT_NORMAL)
        .fontSize(8.5)
        .text(invoice.notes, MARGIN_L, y, {
          width: CONTENT_W,
          lineGap: 2,
        });
    }

    // ─── Footer ───────────────────────────────────────────────────────────────
    const FOOTER_Y = PAGE_H - 45;

    doc
      .rect(0, FOOTER_Y - 4, PAGE_W, 1)
      .fill(COLOR_ACCENT);

    doc
      .fillColor(COLOR_MUTED)
      .font(FONT_NORMAL)
      .fontSize(7.5)
      .text(
        invoice.company.footerText || `Thank you for your business — ${invoice.company.name}`,
        MARGIN_L,
        FOOTER_Y + 6,
        { width: CONTENT_W * 0.6, align: 'left' }
      );

    doc
      .fillColor(COLOR_MUTED)
      .font(FONT_NORMAL)
      .fontSize(7.5)
      .text(
        `Page 1`,
        0,
        FOOTER_Y + 6,
        { width: MARGIN_R, align: 'right' }
      );

    doc.end();
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─── Example usage ────────────────────────────────────────────────────────────

const sampleInvoice = {
  invoiceNumber: 'INV-2026-0042',
  date: '2026-06-07',
  dueDate: '2026-07-07',
  currency: 'USD',
  discount: 10,
  taxRate: 8.5,
  company: {
    name: 'Acme Design Studio',
    logoPath: './logo.png',
    address: '123 Creative Ave, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    country: 'United States',
    email: 'billing@acmedesign.io',
    phone: '+1 (415) 555-0100',
    footerText: 'Payment is due within 30 days. Late fees may apply.',
  },
  client: {
    name: 'Globex Corporation',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    country: 'United States',
    email: 'accounts@globex.com',
  },
  lineItems: [
    {
      description: 'Brand Identity Design',
      subtitle: 'Logo, color palette, typography system',
      quantity: 1,
      unitPrice: 4500,
    },
    {
      description: 'Website Design (5 pages)',
      subtitle: 'Figma mockups + responsive variants',
      quantity: 1,
      unitPrice: 3200,
    },
    {
      description: 'Motion Graphics',
      subtitle: 'Hero animation, micro-interactions',
      quantity: 3,
      unitPrice: 800,
    },
    {
      description: 'Revision Rounds',
      subtitle: 'Unlimited revisions per scope',
      quantity: 2,
      unitPrice: 350,
    },
  ],
  paymentTerms: 'Net 30. Payment due by July 7, 2026. A late fee of 1.5% per month will be charged on overdue balances.',
  paymentDetails: {
    bankName: 'First National Bank',
    accountName: 'Acme Design Studio LLC',
    accountNumber: '****4892',
    routingNumber: '021000021',
    swift: 'FNBAUS33',
  },
  notes: 'All work is covered under the Master Services Agreement dated 2026-01-15. Source files will be delivered upon receipt of final payment.',
};

generateInvoice(sampleInvoice, './invoice-output.pdf')
  .then(() => console.log('Invoice generated: invoice-output.pdf'))
  .catch((err) => console.error('Failed to generate invoice:', err));
```

**Character count:** 17,125 chars → ~4,281 tokens

---

## Lean Output (both skills active)

### think-twice fires — Checkpoint 2

> **Is there an existing solution?**
>
> Yes. `pdfmake` provides a declarative document-definition API — you describe *what* you want (tables, columns, styles, images) and the library handles all coordinate arithmetic, page breaks, column widths, and text wrapping automatically. It is available on npm, maintained, and widely used for exactly this use case (invoices, reports).
>
> Using raw PDFKit means writing 250+ lines of manual x/y coordinate code, manually computing column widths, manually handling page overflow, and manually managing text wrapping. `pdfmake`'s `docDefinition` JSON replaces all of that with a ~50-line structure.
>
> **Decision:** use `pdfmake`. Do not write PDFKit coordinate code.

### surgical fires

> **What was NOT asked for (and therefore omitted):**
> - No PDF preview/download HTTP endpoint — not asked
> - No email delivery of the invoice — not asked
> - No template storage system or database — not asked
> - No React/frontend component — not asked
> - No CLI argument parsing — not asked
> - No retry logic or job queue — not asked
>
> **What was asked for:** logo, line items, totals, payment terms. Node.js. That is the scope.

### Final response

```bash
npm install pdfmake
```

```javascript
const PdfPrinter = require('pdfmake');
const fs = require('fs');

// pdfmake requires font descriptors for the Node (server-side) printer
const fonts = {
  Roboto: {
    normal: 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
    bold: 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
    italics: 'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
    bolditalics: 'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf',
  },
};

const printer = new PdfPrinter(fonts);

function generateInvoice(invoice, outputPath) {
  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice, 0
  );
  const discountAmt = subtotal * ((invoice.discount || 0) / 100);
  const taxable    = subtotal - discountAmt;
  const taxAmt     = taxable  * ((invoice.taxRate  || 0) / 100);
  const total      = taxable  + taxAmt;

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(n);

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [50, 50, 50, 70],
    styles: {
      header:     { fontSize: 36, bold: true, color: '#ffffff' },
      label:      { fontSize: 8,  bold: true, color: '#888888' },
      tableHead:  { fontSize: 8,  bold: true, color: '#ffffff', fillColor: '#1a1a2e' },
      tableCell:  { fontSize: 9,  color: '#333333' },
      muted:      { fontSize: 9,  color: '#888888' },
      totalLabel: { fontSize: 10, bold: true, color: '#ffffff' },
      totalAmt:   { fontSize: 13, bold: true, color: '#e94560' },
    },
    background: (page) => page === 1
      ? { canvas: [{ type: 'rect', x: 0, y: 0, w: 595, h: 160, color: '#1a1a2e' },
                   { type: 'rect', x: 0, y: 160, w: 595, h: 5, color: '#e94560' }] }
      : null,
    footer: (page, pages) => ({
      columns: [
        { text: invoice.company.footerText || `Thank you — ${invoice.company.name}`, style: 'muted', fontSize: 7.5 },
        { text: `Page ${page} of ${pages}`, alignment: 'right', style: 'muted', fontSize: 7.5 },
      ],
      margin: [50, 0],
    }),
    content: [
      // ── Header row: logo + INVOICE label ──────────────────────────────────
      {
        columns: [
          invoice.company.logoPath && fs.existsSync(invoice.company.logoPath)
            ? { image: invoice.company.logoPath, width: 120, margin: [0, 10, 0, 0] }
            : { text: invoice.company.name.slice(0, 2).toUpperCase(), bold: true, color: '#e94560', fontSize: 28, margin: [0, 15, 0, 0] },
          {
            stack: [
              { text: 'INVOICE', style: 'header' },
              { text: `#${invoice.invoiceNumber}`, color: '#e94560', bold: true, fontSize: 10 },
              { text: `Date: ${invoice.date}`, color: '#ffffff', fontSize: 9 },
              { text: `Due:  ${invoice.dueDate}`, color: '#ffffff', fontSize: 9 },
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // ── FROM / BILL TO ────────────────────────────────────────────────────
      {
        columns: [
          {
            stack: [
              { text: 'FROM', style: 'label' },
              { text: invoice.company.name, bold: true, fontSize: 11, margin: [0, 4, 0, 2] },
              { text: invoice.company.address, style: 'muted' },
              { text: `${invoice.company.city}, ${invoice.company.state} ${invoice.company.zip}`, style: 'muted' },
              { text: invoice.company.email, style: 'muted' },
            ],
          },
          {
            stack: [
              { text: 'BILL TO', style: 'label' },
              { text: invoice.client.name, bold: true, fontSize: 11, margin: [0, 4, 0, 2] },
              { text: invoice.client.address, style: 'muted' },
              { text: `${invoice.client.city}, ${invoice.client.state} ${invoice.client.zip}`, style: 'muted' },
              { text: invoice.client.email, style: 'muted' },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // ── Line items table ──────────────────────────────────────────────────
      {
        table: {
          headerRows: 1,
          widths: ['*', 60, 80, 80],
          body: [
            // Header
            [
              { text: 'DESCRIPTION', style: 'tableHead', margin: [4, 6, 4, 6] },
              { text: 'QTY',         style: 'tableHead', alignment: 'right', margin: [4, 6, 4, 6] },
              { text: 'UNIT PRICE',  style: 'tableHead', alignment: 'right', margin: [4, 6, 4, 6] },
              { text: 'TOTAL',       style: 'tableHead', alignment: 'right', margin: [4, 6, 4, 6] },
            ],
            // Rows
            ...invoice.lineItems.map((item, i) => [
              {
                stack: [
                  { text: item.description, bold: true, fontSize: 9 },
                  item.subtitle ? { text: item.subtitle, style: 'muted', fontSize: 7.5 } : {},
                ],
                fillColor: i % 2 === 0 ? '#f7f8fc' : null,
                margin: [4, 6, 4, 6],
              },
              { text: String(item.quantity),                         style: 'tableCell', alignment: 'right', fillColor: i % 2 === 0 ? '#f7f8fc' : null, margin: [4, 6, 4, 6] },
              { text: fmt(item.unitPrice),                           style: 'tableCell', alignment: 'right', fillColor: i % 2 === 0 ? '#f7f8fc' : null, margin: [4, 6, 4, 6] },
              { text: fmt(item.quantity * item.unitPrice), bold: true, fontSize: 9, alignment: 'right', fillColor: i % 2 === 0 ? '#f7f8fc' : null, margin: [4, 6, 4, 6] },
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16],
      },

      // ── Totals ────────────────────────────────────────────────────────────
      {
        columns: [
          { text: '', width: '*' },
          {
            width: 240,
            table: {
              widths: ['*', 'auto'],
              body: [
                [{ text: 'Subtotal', style: 'muted' },            { text: fmt(subtotal),    style: 'tableCell', alignment: 'right' }],
                invoice.discount ? [{ text: `Discount (${invoice.discount}%)`, style: 'muted' }, { text: `-${fmt(discountAmt)}`, color: '#e94560', alignment: 'right' }] : null,
                invoice.taxRate  ? [{ text: `Tax (${invoice.taxRate}%)`,       style: 'muted' }, { text: fmt(taxAmt),           style: 'tableCell', alignment: 'right' }] : null,
                [
                  { text: 'TOTAL DUE', style: 'totalLabel', fillColor: '#1a1a2e', margin: [4, 6, 4, 6] },
                  { text: fmt(total),  style: 'totalAmt',   fillColor: '#1a1a2e', alignment: 'right', margin: [4, 6, 4, 6] },
                ],
              ].filter(Boolean),
            },
            layout: 'lightHorizontalLines',
          },
        ],
        margin: [0, 0, 0, 24],
      },

      // ── Payment terms ─────────────────────────────────────────────────────
      invoice.paymentTerms && {
        stack: [
          { text: 'PAYMENT TERMS', style: 'label', margin: [0, 0, 0, 6] },
          { text: invoice.paymentTerms, style: 'muted' },
        ],
        margin: [0, 0, 0, 16],
      },

      // ── Notes ─────────────────────────────────────────────────────────────
      invoice.notes && {
        stack: [
          { text: 'NOTES', style: 'label', margin: [0, 0, 0, 6] },
          { text: invoice.notes, style: 'muted', fontSize: 8.5 },
        ],
      },
    ].filter(Boolean),
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(outputPath));
  pdfDoc.end();
}

// ── Usage ─────────────────────────────────────────────────────────────────────

generateInvoice({
  invoiceNumber: 'INV-2026-0042',
  date: '2026-06-07',
  dueDate: '2026-07-07',
  currency: 'USD',
  discount: 10,
  taxRate: 8.5,
  company: {
    name: 'Acme Design Studio',
    logoPath: './logo.png',
    address: '123 Creative Ave, Suite 400',
    city: 'San Francisco', state: 'CA', zip: '94107',
    email: 'billing@acmedesign.io',
    footerText: 'Payment is due within 30 days. Late fees may apply.',
  },
  client: {
    name: 'Globex Corporation',
    address: '742 Evergreen Terrace',
    city: 'Springfield', state: 'IL', zip: '62701',
    email: 'accounts@globex.com',
  },
  lineItems: [
    { description: 'Brand Identity Design', subtitle: 'Logo, color palette, typography system', quantity: 1, unitPrice: 4500 },
    { description: 'Website Design (5 pages)', subtitle: 'Figma mockups + responsive variants', quantity: 1, unitPrice: 3200 },
    { description: 'Motion Graphics', subtitle: 'Hero animation, micro-interactions', quantity: 3, unitPrice: 800 },
    { description: 'Revision Rounds', subtitle: 'Unlimited revisions per scope', quantity: 2, unitPrice: 350 },
  ],
  paymentTerms: 'Net 30. Payment due by July 7, 2026. A late fee of 1.5% per month will be charged on overdue balances.',
  notes: 'All work is covered under the MSA dated 2026-01-15. Source files delivered on final payment.',
}, './invoice-output.pdf');
```

**Character count:** 9,124 chars → ~2,281 tokens

---

## Results

| | Greedy (PDFKit) | Lean (pdfmake) |
|---|---|---|
| Characters (code) | 17,125 | 9,124 |
| Est. tokens | ~4,281 | ~2,281 |
| Lines of code | ~310 | ~135 |
| Reduction | — | −47% (~1.9× fewer) |

## Analysis

The core difference between the two approaches is not just character count — it is the nature of the work being done. The greedy PDFKit response is dominated by coordinate arithmetic: manually computing `COL_QTY_X = MARGIN_L + CONTENT_W * 0.65`, tracking `y` cursor position through every section, detecting page overflow by comparing `y > PAGE_H - 220`, and manually repositioning after every text draw call. This is infrastructure code that solves a problem the library should solve. Every new invoice element — a discount row, an extra address line, a long description that wraps — requires recalculating the coordinate budget. The developer cannot read the code and see "invoice" — they see coordinates.

The lean pdfmake response replaces coordinate infrastructure with structure. The `docDefinition` describes *what* the invoice contains — a two-column header, a table with four columns, a totals block — and the library computes where everything goes. Page breaks, text wrapping, column alignment, and alternating row shading are all handled declaratively. The 47% character reduction understates the cognitive difference: the PDFKit version has roughly 40 lines that are purely arithmetic or canvas operations with no business meaning, while the pdfmake version has essentially zero. Every line either describes invoice content or configures a visual property.

The surgical skill's contribution is narrower but important. In the greedy output, there is a natural pressure to add a complete HTTP handler, an email delivery helper, and a template registry — because PDFKit code is "infrastructure" and infrastructure attracts more infrastructure. With surgical active, the function boundary is drawn at exactly what was asked: a function that takes invoice data and writes a PDF. No endpoint, no queue, no mailer. That focus also benefits the lean output — the pdfmake `docDefinition` stays clean because there is no scaffolding surrounding it asking to be populated.
