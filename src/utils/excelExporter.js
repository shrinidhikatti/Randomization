import * as XLSX from 'xlsx'

/**
 * Builds and triggers download of the results Excel file.
 * Sheet 1: Selected (green header)
 * Sheet 2: Remaining (orange header)
 * Sheet 3: Summary
 */
export function downloadResultsExcel({ selected, remaining, headers, schemeName, count, total }) {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Selected ──────────────────────────────────────────────────────
  const selectedData = [headers, ...selected.map((row) => headers.map((h) => row[h] ?? ''))]
  const wsSelected = XLSX.utils.aoa_to_sheet(selectedData)
  styleHeaderRow(wsSelected, headers.length, { fgColor: { rgb: '1A7A4A' } })
  XLSX.utils.book_append_sheet(wb, wsSelected, 'Selected')

  // ── Sheet 2: Remaining ─────────────────────────────────────────────────────
  const remainingData = [headers, ...remaining.map((row) => headers.map((h) => row[h] ?? ''))]
  const wsRemaining = XLSX.utils.aoa_to_sheet(remainingData)
  styleHeaderRow(wsRemaining, headers.length, { fgColor: { rgb: 'E87722' } })
  XLSX.utils.book_append_sheet(wb, wsRemaining, 'Remaining')

  // ── Sheet 3: Summary ───────────────────────────────────────────────────────
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const summaryData = [
    ['Randomization — Beneficiary Selector'],
    [],
    ['Scheme Name', schemeName || '(Not specified)'],
    ['Date of Selection', dateStr],
    ['Time of Selection', timeStr],
    [],
    ['Total Entries', total],
    ['Selected', count],
    ['Remaining', total - count],
    [],
    ['Algorithm', 'Fisher-Yates random shuffle with crypto.getRandomValues()'],
    ['Data Privacy', 'Selection performed entirely in-browser. No data uploaded to any server.'],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

  // ── Trigger download ───────────────────────────────────────────────────────
  const safeName = (schemeName || 'Selection').replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_')
  const dateTag = now.toISOString().slice(0, 10)
  const filename = `Randomization_${safeName}_${dateTag}.xlsx`

  XLSX.writeFile(wb, filename)
}

/**
 * Applies a colored background to the first row of a worksheet.
 * Only works with xlsx pro / cell styles — basic SheetJS supports this via cell `s` property
 * when using the `cellStyles: true` option on read. For write we attach styles directly.
 */
function styleHeaderRow(ws, colCount, fill) {
  for (let c = 0; c < colCount; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c })
    if (!ws[cellRef]) continue
    ws[cellRef].s = {
      fill: { patternType: 'solid', ...fill },
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center' },
    }
  }
}
