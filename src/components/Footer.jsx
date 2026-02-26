export default function Footer() {
  return (
    <footer className="bg-navy text-white mt-auto py-4">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/60">
        <p>Randomization — Beneficiary Selection Tool</p>
        <p>
          Designed and developed by{' '}
          <a
            href="https://prahanvitech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange font-medium hover:text-orange/80 transition-colors underline underline-offset-2"
          >
            Shrinidhi Katti
          </a>
        </p>
      </div>
    </footer>
  )
}
