'use client'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-8">California Probate & Trust - Offer Marketplace</p>
        <p className="text-gray-600 text-sm mb-8">Last Updated: July 3, 2026</p>

        {/* 1. Acceptance */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing and using this offer marketplace platform (the "Service"), you accept and agree to be bound by the terms and conditions of this Terms of Service. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        {/* 2. Use License */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
          <p className="text-gray-700 mb-4">
            Permission is granted to temporarily download one copy of the materials (information or software) on our Service for personal, non-commercial transactional use only. This is the grant of a license, not a transfer of title.
          </p>
          <p className="text-gray-700 font-semibold mb-2">You may not:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or public display</li>
            <li>Attempt to decompile or reverse engineer any software</li>
            <li>Remove any copyright or proprietary notations</li>
            <li>Transfer materials to another person or mirror on another server</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        {/* 3. Disclaimer */}
        <section className="mb-8 bg-red-50 border-2 border-red-200 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-900 mb-4">3. IMPORTANT: NO FINANCIAL PRODUCT OR LOAN ARRANGEMENT</h2>
          <p className="text-red-800 font-semibold mb-4">
            This Service is a marketplace platform only. We do NOT offer, provide, or broker any financial products, direct lending, loan arrangements, mortgages, financing, or credit products.
          </p>
          <div className="space-y-3 text-red-800">
            <div>
              <p className="font-semibold mb-2">We Do NOT:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide direct lending or loan arrangements</li>
                <li>Offer mortgages, financing, or credit products</li>
                <li>Act as a financial advisor</li>
                <li>Guarantee any transaction outcomes</li>
                <li>Provide legal advice (consult an attorney)</li>
                <li>Guarantee accuracy of property information</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">You Are Responsible For:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Conducting your own due diligence</li>
                <li>Obtaining independent legal and financial advice</li>
                <li>Verifying all information before submitting offers</li>
                <li>Understanding all legal obligations in real estate transactions</li>
                <li>Complying with all applicable federal, state, and local laws</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Marketplace Conduct */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Marketplace Conduct</h2>
          <p className="text-gray-700 font-semibold mb-2">Users agree to:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Provide accurate and truthful information</li>
            <li>Not engage in fraudulent, deceptive, or unlawful conduct</li>
            <li>Not harass, threaten, or abuse other users</li>
            <li>Not submit false or misleading offers</li>
            <li>Respect intellectual property rights of others</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Not attempt unauthorized access to the Service</li>
          </ul>
        </section>

        {/* 5. Offer Submission */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Offer Submission & Requirements</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>All offers must be in $500 increments</li>
            <li>Offers are binding upon submission</li>
            <li>Offers must meet minimum specified amounts</li>
            <li>Sellers may accept, reject, or counter any offer</li>
            <li>Offering period: 13 days with 15-minute auto-extend functionality</li>
            <li>All transactions remain subject to applicable real estate laws</li>
          </ul>
        </section>

        {/* 6. User Accounts */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>You are responsible for maintaining account confidentiality</li>
            <li>You are responsible for all activity under your account</li>
            <li>Notify us immediately of unauthorized use</li>
            <li>We reserve the right to suspend or terminate violating accounts</li>
            <li>You are responsible for losses from unauthorized account use</li>
          </ul>
        </section>

        {/* 7. Payment & Transactions */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment & Transaction Terms</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>No payments are processed through our platform</li>
            <li>Users must arrange all financial transactions independently</li>
            <li>Users must comply with all legal requirements for real estate transactions</li>
            <li>Offers are subject to all applicable contingencies and legal requirements</li>
            <li>We do not guarantee completion of any transaction</li>
          </ul>
        </section>

        {/* 8. Property Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Property Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Property descriptions are provided for informational purposes only</li>
            <li>Conduct independent inspections and appraisals</li>
            <li>We do not warrant accuracy of property information</li>
            <li>Verify all material facts independently</li>
            <li>Property images may not reflect current condition</li>
          </ul>
        </section>

        {/* 9. Limitation of Liability */}
        <section className="mb-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-700 font-semibold mb-3">TO THE FULLEST EXTENT PERMITTED BY LAW:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Our Service is provided "AS-IS" without warranty of any kind</li>
            <li>We are not liable for any direct, indirect, incidental, special, or consequential damages</li>
            <li>We are not liable for loss of profits, data, or use</li>
            <li>We are not liable for any third-party actions or transactions</li>
            <li>Our total liability is limited to $100 or the amount you paid, whichever is less</li>
          </ul>
          <p className="text-gray-700 font-semibold mt-4">Users assume all risk associated with use of this Service.</p>
        </section>

        {/* 10. Indemnification */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify and hold harmless California Probate & Trust, its owners, employees, and agents from any claims, damages, losses, or expenses arising from:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
            <li>Your use of the Service</li>
            <li>Your violation of these terms</li>
            <li>Your violation of any law or regulation</li>
            <li>Disputes between users</li>
            <li>Your transactions or offers</li>
            <li>Any content you submit</li>
          </ul>
        </section>

        {/* 11. Intellectual Property */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Intellectual Property</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>All content, design, and functionality is owned by California Probate & Trust or its licensors</li>
            <li>You may not reproduce, distribute, or transmit content without permission</li>
            <li>You retain ownership of content you submit</li>
            <li>You grant us a license to use submitted content for marketplace operation</li>
          </ul>
        </section>

        {/* 12. Termination */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
          <p className="text-gray-700 mb-3">
            We reserve the right to terminate or suspend your account and access to the Service at any time, for any reason, including:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Violation of these terms</li>
            <li>Unlawful conduct</li>
            <li>Inactivity</li>
            <li>Payment issues</li>
            <li>Marketplace violations</li>
          </ul>
        </section>

        {/* 13. User-Generated Content */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. User-Generated Content</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>You are responsible for all content you submit</li>
            <li>You warrant that submitted content does not violate any laws or rights</li>
            <li>We reserve the right to remove violating content</li>
            <li>We do not endorse or verify user-submitted content</li>
          </ul>
        </section>

        {/* 14. Dispute Resolution */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Dispute Resolution</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Disputes between users are not the responsibility of our platform</li>
            <li>Users agree to resolve disputes through direct negotiation or applicable legal processes</li>
            <li>We are not responsible for mediation or arbitration of user disputes</li>
            <li>All transactions are subject to applicable real estate law</li>
          </ul>
        </section>

        {/* 15. Third-Party Links */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Third-Party Links & Services</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Our Service may contain links to third-party websites</li>
            <li>We are not responsible for third-party content or services</li>
            <li>Review third-party terms and privacy policies independently</li>
            <li>Use of third-party services is at your own risk</li>
          </ul>
        </section>

        {/* 16. Modifications */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Modifications to Service</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>We reserve the right to modify or discontinue the Service at any time</li>
            <li>We reserve the right to modify these terms at any time</li>
            <li>Continued use constitutes acceptance of modified terms</li>
            <li>We will notify users of material changes</li>
          </ul>
        </section>

        {/* 17. Compliance with Laws */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Compliance with Laws</h2>
          <p className="text-gray-700 mb-3">
            You agree to comply with all applicable federal, state, and local laws, including:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Fair Housing Act</li>
            <li>Equal Credit Opportunity Act</li>
            <li>State real estate licensing laws</li>
            <li>Anti-discrimination laws</li>
            <li>Consumer protection laws</li>
            <li>Money laundering and terrorism financing laws</li>
          </ul>
        </section>

        {/* 18. Governing Law */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Governing Law</h2>
          <p className="text-gray-700">
            These Terms of Service are governed by the laws of the State of California, without regard to its conflicts of law principles. You agree to submit to the exclusive jurisdiction of California courts.
          </p>
        </section>

        {/* 19. Contact */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">19. Contact Us</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900 font-semibold">California Probate & Trust</p>
            <p className="text-gray-700">Email: support@cpt.law</p>
            <p className="text-gray-700">Website: https://cpt.law</p>
          </div>
        </section>

        {/* 20. Severability */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">20. Severability</h2>
          <p className="text-gray-700">
            If any provision of these terms is found to be unenforceable, the remaining provisions shall remain in effect.
          </p>
        </section>

        {/* 21. Entire Agreement */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">21. Entire Agreement</h2>
          <p className="text-gray-700">
            These Terms of Service, together with our Privacy Policy and other terms posted on our Service, constitute the entire agreement between you and California Probate & Trust regarding use of the Service.
          </p>
        </section>

        {/* Acknowledgment */}
        <section className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-blue-900 font-semibold text-center">
            ✓ By using this Service, you acknowledge that you have read, understand, and agree to be bound by these Terms of Service.
          </p>
          <p className="text-blue-900 font-semibold text-center mt-2">
            ✓ You acknowledge that NO financial product, loan arrangement, or direct lending is being offered through this platform.
          </p>
        </section>
      </div>
    </div>
  )
}
