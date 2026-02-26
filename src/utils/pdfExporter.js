import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function downloadResultsPDF({ selected, remaining, headers, schemeName, count, total }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const scheme = schemeName || 'Beneficiary Selection'

  const navyR = 15, navyG = 39, navyB = 68
  const orangeR = 232, orangeG = 119, orangeB = 34
  const greenR = 26, greenG = 122, greenB = 74

  // ── Page 1: Cover / Summary ────────────────────────────────────────────────
  // Header band
  doc.setFillColor(navyR, navyG, navyB)
  doc.rect(0, 0, 297, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('RandomSelect', 14, 16)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Beneficiary Selection Report', 14, 24)

  doc.setFontSize(9)
  doc.setTextColor(200, 210, 230)
  doc.text('Selection performed using Fisher-Yates shuffle with crypto.getRandomValues()', 14, 32)
  doc.text(`Generated: ${dateStr}  ${timeStr}`, 200, 32)

  // Scheme name
  doc.setTextColor(navyR, navyG, navyB)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(scheme, 14, 56)

  // Summary boxes
  const boxes = [
    { label: 'Total Entries', value: total.toLocaleString(), color: [navyR, navyG, navyB] },
    { label: 'Selected', value: count.toLocaleString(), color: [greenR, greenG, greenB] },
    { label: 'Remaining', value: (total - count).toLocaleString(), color: [orangeR, orangeG, orangeB] },
  ]

  boxes.forEach((box, i) => {
    const x = 14 + i * 70
    doc.setFillColor(...box.color)
    doc.roundedRect(x, 64, 62, 28, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(box.value, x + 31, 78, { align: 'center' })
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(box.label, x + 31, 86, { align: 'center' })
  })

  // Meta info table
  autoTable(doc, {
    startY: 100,
    head: [['Field', 'Value']],
    body: [
      ['Scheme Name', scheme],
      ['Date of Selection', dateStr],
      ['Time of Selection', timeStr],
      ['Total Entries', total.toLocaleString()],
      ['Selected', count.toLocaleString()],
      ['Remaining', (total - count).toLocaleString()],
      ['Algorithm', 'Fisher-Yates random shuffle'],
      ['Randomness Source', 'crypto.getRandomValues() — cryptographically secure'],
      ['Data Privacy', 'Processed entirely in-browser. No data uploaded to any server.'],
    ],
    headStyles: { fillColor: [navyR, navyG, navyB], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 244, 250] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  })

  // ── Page 2: Selected ──────────────────────────────────────────────────────
  doc.addPage()
  addTablePage(doc, {
    title: `Selected Beneficiaries  (${count.toLocaleString()} of ${total.toLocaleString()})`,
    subtitle: scheme,
    headers,
    rows: selected,
    headerColor: [greenR, greenG, greenB],
    navyColor: [navyR, navyG, navyB],
  })

  // ── Page 3: Remaining ─────────────────────────────────────────────────────
  doc.addPage()
  addTablePage(doc, {
    title: `Remaining Entries  (${(total - count).toLocaleString()})`,
    subtitle: scheme,
    headers,
    rows: remaining,
    headerColor: [orangeR, orangeG, orangeB],
    navyColor: [navyR, navyG, navyB],
  })

  // Footer on every page
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(160, 170, 185)
    doc.text(`RandomSelect  •  ${scheme}  •  Page ${p} of ${pageCount}`, 148, 205, { align: 'center' })
  }

  const safeName = scheme.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_')
  const dateTag = now.toISOString().slice(0, 10)
  doc.save(`RandomSelection_${safeName}_${dateTag}.pdf`)
}

function addTablePage(doc, { title, subtitle, headers, rows, headerColor, navyColor }) {
  // Header band
  doc.setFillColor(...navyColor)
  doc.rect(0, 0, 297, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(subtitle, 14, 17)

  if (rows.length === 0) {
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(11)
    doc.text('No entries', 148, 100, { align: 'center' })
    return
  }

  const tableHeaders = headers.map((h) => ({ content: h, styles: { fontStyle: 'bold' } }))
  const tableRows = rows.map((row) => headers.map((h) => String(row[h] ?? '')))

  autoTable(doc, {
    startY: 27,
    head: [tableHeaders],
    body: tableRows,
    headStyles: { fillColor: headerColor, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    styles: { fontSize: 8, cellPadding: 2, overflow: 'ellipsize' },
    margin: { left: 8, right: 8 },
  })
}
