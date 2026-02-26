import { useState } from 'react'
import { Shuffle, UploadCloud, CheckCircle2, ListFilter, Lock, FileText } from 'lucide-react'
import DownloadButton from './DownloadButton'
import { downloadResultsPDF } from '../utils/pdfExporter'
import { downloadResultsExcel } from '../utils/excelExporter'

export default function ResultStep({ selected, remaining, headers, schemeName, total, count, onShuffle, onReset, isFinal, onFinalShuffle }) {
  const [activeTab, setActiveTab] = useState('selected')
  const [generating, setGenerating] = useState(false)

  const rows = activeTab === 'selected' ? selected : remaining

  function handleFinalShuffle() {
    setGenerating(true)
    setTimeout(() => {
      try {
        // Do one final shuffle via parent, then download both reports
        onFinalShuffle()
      } finally {
        setGenerating(false)
      }
    }, 50)
  }

  return (
    <div className="space-y-6">
      {/* Finalized banner */}
      {isFinal && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3">
          <Lock size={18} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm">Selection Finalized</p>
            <p className="text-xs opacity-80">This result is locked. Shuffling is disabled. Reports have been downloaded.</p>
          </div>
        </div>
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Total" value={total.toLocaleString()} color="navy" />
        <SummaryCard label="Selected" value={count.toLocaleString()} color="success" />
        <SummaryCard label="Remaining" value={(total - count).toLocaleString()} color="orange" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        <TabButton
          active={activeTab === 'selected'}
          onClick={() => setActiveTab('selected')}
          icon={<CheckCircle2 size={15} />}
          label="Selected"
          count={selected.length}
          activeClass="bg-success text-white"
        />
        <TabButton
          active={activeTab === 'remaining'}
          onClick={() => setActiveTab('remaining')}
          icon={<ListFilter size={15} />}
          label="Remaining"
          count={remaining.length}
          activeClass="bg-orange text-white"
        />
      </div>

      {/* Data table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm max-h-[420px] overflow-y-auto scrollbar-thin">
        <table className="min-w-full text-sm">
          <thead className={`sticky top-0 ${activeTab === 'selected' ? 'bg-success' : 'bg-orange'} text-white`}>
            <tr>
              <th className="px-3 py-2.5 text-left font-medium w-12">#</th>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="px-4 py-8 text-center text-gray-400">
                  No entries
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-gray-400 text-xs">{ri + 1}</td>
                  {headers.map((h, ci) => (
                    <td key={ci} className="px-4 py-2 text-gray-700 whitespace-nowrap max-w-[220px] truncate">
                      {String(row[h] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Actions row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Shuffle Again */}
        <button
          onClick={onShuffle}
          disabled={isFinal}
          title={isFinal ? 'Selection has been finalized' : 'Run a new random shuffle'}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-colors
            ${isFinal
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-orange text-orange hover:bg-orange/5'
            }`}
        >
          <Shuffle size={16} />
          Shuffle Again
        </button>

        {/* Final Shuffle & Generate Report */}
        {!isFinal && (
          <button
            onClick={handleFinalShuffle}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-navy/90 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock size={15} />
                <FileText size={15} />
              </>
            )}
            {generating ? 'Generating…' : 'Final Shuffle & Generate Report'}
          </button>
        )}

        {/* Upload new file */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          <UploadCloud size={16} />
          Upload New File
        </button>

        {/* Manual download (always visible after finalize too) */}
        <div className="ml-auto">
          <DownloadButton
            selected={selected}
            remaining={remaining}
            headers={headers}
            schemeName={schemeName}
            count={count}
            total={total}
          />
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  const colors = {
    navy: 'bg-navy text-white',
    success: 'bg-success text-white',
    orange: 'bg-orange text-white',
  }
  return (
    <div className={`${colors[color]} rounded-xl p-4 text-center`}>
      <p className="text-2xl font-bold font-serif">{value}</p>
      <p className="text-xs mt-0.5 opacity-80 font-medium">{label}</p>
    </div>
  )
}

function TabButton({ active, onClick, icon, label, count, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
        ${active ? activeClass + ' shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {icon}
      {label}
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>
        {count.toLocaleString()}
      </span>
    </button>
  )
}
