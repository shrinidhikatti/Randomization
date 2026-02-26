import * as XLSX from 'xlsx'

/**
 * Reads an uploaded File object and returns parsed data.
 * Returns: { headers, rows, sheetName, totalRows, headerRowIndex }
 */
export function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        // Get all rows as arrays (raw values)
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

        if (rawRows.length === 0) {
          reject(new Error('The Excel file appears to be empty.'))
          return
        }

        // Auto-detect header row: try rows 0, 1, 2
        // Score each row: higher score = more likely a header
        const headerRowIndex = detectHeaderRow(rawRows)
        const headers = rawRows[headerRowIndex].map((h) => String(h).trim())
        const dataRows = rawRows.slice(headerRowIndex + 1).filter((row) =>
          row.some((cell) => cell !== '' && cell !== null && cell !== undefined)
        )

        // Convert each data row to an object keyed by headers
        const rows = dataRows.map((row) => {
          const obj = {}
          headers.forEach((h, i) => {
            obj[h] = row[i] !== undefined ? row[i] : ''
          })
          return obj
        })

        resolve({
          headers,
          rows,
          sheetName,
          totalRows: rows.length,
          headerRowIndex,
          rawRows,
        })
      } catch (err) {
        reject(new Error('Failed to parse Excel file: ' + err.message))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Re-parse with a specific header row index (user override).
 */
export function reparseWithHeaderRow(rawRows, headerRowIndex) {
  const headers = rawRows[headerRowIndex].map((h) => String(h).trim())
  const dataRows = rawRows.slice(headerRowIndex + 1).filter((row) =>
    row.some((cell) => cell !== '' && cell !== null && cell !== undefined)
  )
  const rows = dataRows.map((row) => {
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined ? row[i] : ''
    })
    return obj
  })
  return { headers, rows, totalRows: rows.length, headerRowIndex }
}

/**
 * Heuristic: a header row tends to have string values, no numbers, no blanks.
 * Checks rows 0–2 and returns the index with the best score.
 */
function detectHeaderRow(rawRows) {
  const candidates = Math.min(3, rawRows.length)
  let bestIndex = 0
  let bestScore = -Infinity

  for (let i = 0; i < candidates; i++) {
    const row = rawRows[i]
    if (!row || row.length === 0) continue
    let score = 0
    for (const cell of row) {
      const val = String(cell).trim()
      if (val === '') score -= 2
      else if (typeof cell === 'string') score += 2
      else if (typeof cell === 'number') score -= 1
    }
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }
  return bestIndex
}
