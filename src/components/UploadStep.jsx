import { useRef, useState } from 'react'
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { readExcelFile, reparseWithHeaderRow } from '../utils/excelReader'

export default function UploadStep({ onComplete }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null) // { headers, rows, totalRows, rawRows, headerRowIndex }
  const inputRef = useRef()

  function handleFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls'].includes(ext)) {
      setError('Only .xlsx and .xls files are supported.')
      return
    }
    setError(null)
    setLoading(true)
    readExcelFile(file)
      .then((result) => {
        setPreview(result)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  function handleHeaderRowChange(e) {
    const idx = parseInt(e.target.value, 10)
    const result = reparseWithHeaderRow(preview.rawRows, idx)
    setPreview({ ...preview, ...result })
  }

  function handleConfirm() {
    onComplete({
      headers: preview.headers,
      rows: preview.rows,
      totalRows: preview.totalRows,
    })
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onClick={() => !preview && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
          ${preview ? 'border-success bg-green-50 cursor-default' : 'hover:border-orange hover:bg-orange/5'}
          ${dragging ? 'border-orange bg-orange/10 scale-[1.01]' : 'border-gray-300 bg-white'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3 text-navy">
            <div className="w-10 h-10 border-4 border-navy border-t-orange rounded-full animate-spin" />
            <p className="font-medium">Reading file…</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-2 text-success">
            <FileSpreadsheet size={40} />
            <p className="font-semibold text-lg">File loaded successfully</p>
            <p className="text-sm text-gray-600">
              {preview.totalRows.toLocaleString()} rows · {preview.headers.length} columns
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setPreview(null); setError(null) }}
              className="mt-2 text-xs text-orange underline underline-offset-2"
            >
              Upload a different file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <UploadCloud size={44} />
            <p className="text-base font-medium text-gray-600">
              Drag & drop your Excel file here, or{' '}
              <span className="text-orange font-semibold">browse</span>
            </p>
            <p className="text-sm">Supports .xlsx and .xls</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Preview table */}
      {preview && (
        <div className="space-y-4">
          {/* Header row selector */}
          <div className="flex items-center gap-3 text-sm">
            <label className="text-gray-600 font-medium shrink-0">Header row:</label>
            <select
              value={preview.headerRowIndex}
              onChange={handleHeaderRowChange}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
            >
              {[0, 1, 2].map((i) => (
                <option key={i} value={i} disabled={i >= preview.rawRows.length}>
                  Row {i + 1}
                </option>
              ))}
            </select>
            <span className="text-gray-400 text-xs">(adjust if headers look wrong)</span>
          </div>

          {/* Table preview */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  {preview.headers.map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                      {h || <span className="italic opacity-50">col {i + 1}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 5).map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {preview.headers.map((h, ci) => (
                      <td key={ci} className="px-4 py-2 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                        {String(row[h] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.totalRows > 5 && (
            <p className="text-xs text-gray-400 text-right">
              Showing 5 of {preview.totalRows.toLocaleString()} rows
            </p>
          )}

          <button
            onClick={handleConfirm}
            className="w-full bg-navy text-white font-semibold py-3 rounded-xl hover:bg-navy/90 transition-colors"
          >
            Confirm & Continue →
          </button>
        </div>
      )}
    </div>
  )
}
