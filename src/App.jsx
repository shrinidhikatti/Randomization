import { useState, useEffect } from 'react'
import { ShieldCheck, Download } from 'lucide-react'
import UploadStep from './components/UploadStep'
import ConfigStep from './components/ConfigStep'
import ResultStep from './components/ResultStep'
import { runRandomSelection } from './utils/randomSelector'
import { downloadResultsExcel } from './utils/excelExporter'
import { downloadResultsPDF } from './utils/pdfExporter'

const STEPS = ['Upload', 'Configure', 'Results']

export default function App() {
  const [step, setStep] = useState(0) // 0 | 1 | 2
  const [fileData, setFileData] = useState(null)   // { headers, rows, totalRows }
  const [config, setConfig] = useState(null)        // { count, schemeName }
  const [results, setResults] = useState(null)      // { selected, remaining }
  const [isFinal, setIsFinal] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    installPrompt.userChoice.then(() => setInstallPrompt(null))
  }

  function handleUploadComplete(data) {
    setFileData(data)
    setConfig(null)
    setResults(null)
    setIsFinal(false)
    setStep(1)
  }

  function handleRunSelection(cfg) {
    const { selected, remaining } = runRandomSelection(fileData.rows, cfg.count)
    setConfig(cfg)
    setResults({ selected, remaining })
    setIsFinal(false)
    setStep(2)
  }

  function handleShuffle() {
    if (!config || !fileData || isFinal) return
    const { selected, remaining } = runRandomSelection(fileData.rows, config.count)
    setResults({ selected, remaining })
  }

  function handleFinalShuffle() {
    if (!config || !fileData) return
    // One final shuffle
    const { selected, remaining } = runRandomSelection(fileData.rows, config.count)
    setResults({ selected, remaining })
    setIsFinal(true)

    // Download both reports after a short delay so state updates render first
    setTimeout(() => {
      const payload = {
        selected,
        remaining,
        headers: fileData.headers,
        schemeName: config.schemeName,
        count: config.count,
        total: fileData.totalRows,
      }
      downloadResultsExcel(payload)
      // Slight stagger so browser doesn't block the second download
      setTimeout(() => downloadResultsPDF(payload), 800)
    }, 100)
  }

  function handleReset() {
    setStep(0)
    setFileData(null)
    setConfig(null)
    setResults(null)
    setIsFinal(false)
  }

  return (
    <div className="min-h-screen bg-appbg flex flex-col">
      {/* Top bar */}
      <header className="bg-navy text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif leading-tight">RandomSelect</h1>
            <p className="text-xs text-white/60 mt-0.5">Beneficiary Selection Tool</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/60">
              <ShieldCheck size={13} />
              Data stays on your device
            </div>
            {installPrompt && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 text-xs bg-orange text-white px-3 py-1.5 rounded-lg font-medium hover:bg-orange/90 transition-colors"
              >
                <Download size={13} />
                Install App
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all
                  ${i < step ? 'bg-success text-white' : i === step ? 'bg-orange text-white' : 'bg-gray-200 text-gray-400'}`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? 'text-navy' : i < step ? 'text-success' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 sm:w-16 ${i < step ? 'bg-success' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {step === 0 && (
            <>
              <h2 className="text-2xl font-serif text-navy mb-1">Upload Excel File</h2>
              <p className="text-sm text-gray-500 mb-6">Upload the beneficiary list you want to randomly select from.</p>
              <UploadStep onComplete={handleUploadComplete} />
            </>
          )}

          {step === 1 && fileData && (
            <>
              <h2 className="text-2xl font-serif text-navy mb-1">Configure Selection</h2>
              <p className="text-sm text-gray-500 mb-6">Set how many entries to randomly select.</p>
              <ConfigStep
                totalRows={fileData.totalRows}
                onRun={handleRunSelection}
                onBack={() => setStep(0)}
              />
            </>
          )}

          {step === 2 && results && fileData && config && (
            <>
              <h2 className="text-2xl font-serif text-navy mb-1">Selection Results</h2>
              {config.schemeName && (
                <p className="text-sm text-orange font-medium mb-1">{config.schemeName}</p>
              )}
              <p className="text-sm text-gray-500 mb-6">
                Randomly selected using Fisher-Yates shuffle with crypto.getRandomValues().
              </p>
              <ResultStep
                selected={results.selected}
                remaining={results.remaining}
                headers={fileData.headers}
                schemeName={config.schemeName}
                total={fileData.totalRows}
                count={config.count}
                isFinal={isFinal}
                onShuffle={handleShuffle}
                onFinalShuffle={handleFinalShuffle}
                onReset={handleReset}
              />
            </>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck size={12} />
          Your file is processed locally. No data is uploaded to any server.
        </p>
      </main>
    </div>
  )
}
