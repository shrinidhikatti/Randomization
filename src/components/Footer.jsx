export default function Footer() {
  return (
    <footer className="bg-navy text-white mt-auto py-8">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-base text-white/70">
        <p className="font-medium text-lg">Randomization — Beneficiary Selection Tool</p>
        <p className="text-base">
          Designed and developed by{' '}
          <a
            href="https://www.prashanvitech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange font-semibold hover:text-orange/80 transition-colors underline underline-offset-4"
          >
            Shrinidhi Katti
          </a>
        </p>
      </div>
    </footer>
  )
}
