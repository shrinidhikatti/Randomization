import { useState } from 'react'
import { Download } from 'lucide-react'
import { downloadResultsExcel } from '../utils/excelExporter'

export default function DownloadButton({ selected, remaining, headers, schemeName, count, total }) {
  const [loading, setLoading] = useState(false)

  function handleDownload() {
    setLoading(true)
    // Defer to next tick so the spinner renders before the (synchronous) xlsx work
    setTimeout(() => {
      try {
        downloadResultsExcel({ selected, remaining, headers, schemeName, count, total })
      } catch (err) {
        alert('Download failed: ' + err.message)
      } finally {
        setLoading(false)
      }
    }, 50)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 bg-navy text-white font-semibold text-sm rounded-xl hover:bg-navy/90 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download size={16} />
      )}
      Download Excel
    </button>
  )
}
