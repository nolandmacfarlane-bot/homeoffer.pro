import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Home Offer</h3>
            <p className="text-sm text-gray-400 mb-4">
              Transparent real estate offer marketplace by California Probate & Trust.
            </p>
            <p className="text-xs text-gray-500">
              © 2026 California Probate & Trust. All rights reserved.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cpt-offer-privacy" className="text-gray-400 hover:text-white transition">
                  CPT Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/sms-policy" className="text-gray-400 hover:text-white transition">
                  SMS Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Compliance</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/data-deletion" className="text-gray-400 hover:text-white transition">
                  Data Deletion (GDPR/CCPA)
                </Link>
              </li>
              <li>
                <Link href="/loa" className="text-gray-400 hover:text-white transition">
                  Letter of Authorization
                </Link>
              </li>
              <li>
                <Link href="/sms-compliance" className="text-gray-400 hover:text-white transition">
                  SMS Compliance
                </Link>
              </li>
              <li>
                <Link href="/account/sms-settings" className="text-gray-400 hover:text-white transition">
                  SMS Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@cpt.law" className="text-gray-400 hover:text-white transition">
                  Email Support
                </a>
              </li>
              <li>
                <a href="tel:916-604-9494" className="text-gray-400 hover:text-white transition">
                  Call: 916-604-9494
                </a>
              </li>
              <li>
                <a href="https://cpt.law" className="text-gray-400 hover:text-white transition">
                  CPT Website
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              California Probate & Trust | Licensed Attorney | Privacy First
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="https://cpt.law" className="hover:text-white transition">
                Visit CPT.Law
              </a>
              <Link href="/sms-policy" className="hover:text-white transition">
                SMS Info
              </Link>
              <a href="mailto:privacy@cpt.law" className="hover:text-white transition">
                Privacy Questions
              </a>
            </div>
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-xs text-gray-500 space-y-1">
          <p>
            ✓ TCPA Compliant | ✓ GDPR Compliant | ✓ CCPA Compliant | ✓ Transparent Marketplace
          </p>
          <p>
            This platform is not a financial product. No loans, mortgages, or credit products are offered. All transactions subject to applicable real estate laws.
          </p>
        </div>
      </div>
    </footer>
  )
}
