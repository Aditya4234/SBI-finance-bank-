export function Footer() {
  return (
    <footer className="gradient-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white/10 text-white font-bold text-xs">SBI</div>
              <span className="font-bold">SBI Banking</span>
            </div>
            <p className="text-sm text-sbi-300">India's largest bank with over 50,000 branches serving millions of customers worldwide.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-sbi-300">
              <li>Personal Banking</li>
              <li>Corporate Banking</li>
              <li>NRI Services</li>
              <li>Loan Products</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-white">Services</h3>
            <ul className="space-y-2 text-sm text-sbi-300">
              <li>Account Opening</li>
              <li>Fund Transfer</li>
              <li>Bill Payment</li>
              <li>Credit Cards</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-white">Contact</h3>
            <ul className="space-y-2 text-sm text-sbi-300">
              <li>1800 123 4567</li>
              <li>support@sbi.co.in</li>
              <li>www.sbi.co.in</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-sbi-300">
          <p>&copy; 2024 State Bank of India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
