import { useState } from 'react'
import { Shuffle, ChevronLeft, AlertTriangle } from 'lucide-react'

export default function ConfigStep({ totalRows, onRun, onBack }) {
  const [count, setCount] = useState('')
  const [schemeName, setSchemeName] = useState('')

  const countNum = parseInt(count, 10)
  const isValid = count !== '' && !isNaN(countNum) && countNum >= 1 && countNum <= totalRows

  const validationMsg =
    count === ''
      ? null
      : isNaN(countNum) || countNum < 1
      ? 'Please enter a number greater than 0.'
      : countNum > totalRows
      ? `Cannot select more than ${totalRows.toLocaleString()} entries.`
      : null

  function handleRun() {
    if (!isValid) return
    onRun({ count: countNum, schemeName: schemeName.trim() })
  }

  return (
    <div className="space-y-6">
      {/* File info banner */}
      <div className="bg-navy/5 border border-navy/10 rounded-xl px-4 py-3 text-sm text-navy font-medium">
        Total entries available:{' '}
        <span className="font-bold text-navy">{totalRows.toLocaleString()}</span>
      </div>

      {/* Scheme name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Scheme Name <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={schemeName}
          onChange={(e) => setSchemeName(e.target.value)}
          placeholder="e.g. Ganga Kalyana Yojana 2025-26 Athani"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
        />
        <p className="text-xs text-gray-400">This will appear as the title in the downloaded Excel report.</p>
      </div>

      {/* Count input */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          How many to select? <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={1}
          max={totalRows}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          placeholder={`Enter a number between 1 and ${totalRows.toLocaleString()}`}
          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors
            ${validationMsg
              ? 'border-red-400 focus:ring-red-200 bg-red-50'
              : isValid
              ? 'border-success focus:ring-green-200'
              : 'border-gray-300 focus:ring-navy/30 focus:border-navy'
            }`}
        />
        {validationMsg && (
          <div className="flex items-center gap-1.5 text-red-600 text-xs">
            <AlertTriangle size={13} />
            {validationMsg}
          </div>
        )}
        {isValid && (
          <p className="text-xs text-success font-medium">
            ✓ {countNum.toLocaleString()} selected · {(totalRows - countNum).toLocaleString()} remaining
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <button
          onClick={handleRun}
          disabled={!isValid}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-base transition-all
            ${isValid
              ? 'bg-orange text-white hover:bg-orange/90 shadow-md hover:shadow-orange/30 hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          <Shuffle size={20} />
          Run Random Selection
        </button>
      </div>
    </div>
  )
}
