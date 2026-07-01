'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'bot'; text: string }>>([])
  const [chatInput, setChatInput] = useState('')

  const faqs = [
    {
      q: 'How does Home Offer work?',
      a: 'Sellers post properties with a starting offer price. Buyers submit offers in $1,000 increments over a 12-day period. If offers come in during the final 15 minutes, the period auto-extends another 15 minutes. Highest offer wins.',
    },
    {
      q: 'Who can use Home Offer?',
      a: 'Listing agents post properties. Buyer agents and independent buyers submit offers. All must be approved by the listing agent before making offers.',
    },
    {
      q: 'What are the offer increments?',
      a: 'All offers must be in $1,000 increments and must exceed the current highest offer or starting price.',
    },
    {
      q: 'How long is the offer period?',
      a: '12 days from listing. If an offer arrives in the final 15 minutes, the period extends 15 more minutes. This repeats until 15 minutes of silence.',
    },
    {
      q: 'Do you handle payments?',
      a: 'No. Home Offer is transparent bidding only. Banks, lenders, and title companies handle all financing and closing.',
    },
    {
      q: 'How do I get approved as a buyer?',
      a: 'Sign up, then the listing agent approves you via email/SMS before you can submit offers.',
    },
  ]

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim().toLowerCase()
    setChatMessages(prev => [...prev, { type: 'user', text: chatInput }])

    let botReply = "I'm not sure about that. Here are some topics I can help with: How it works, Who can use it, Offer increments, Offer period, Payments, or Getting approved."

    const faq = faqs.find(f => userMessage.includes(f.q.toLowerCase().split(' ').slice(0, 2).join(' ')))
    if (faq) {
      botReply = faq.a
    } else if (userMessage.includes('how') || userMessage.includes('work')) {
      botReply = faqs[0].a
    } else if (userMessage.includes('who') || userMessage.includes('use')) {
      botReply = faqs[1].a
    } else if (userMessage.includes('increment') || userMessage.includes('offer amount')) {
      botReply = faqs[2].a
    } else if (userMessage.includes('period') || userMessage.includes('day')) {
      botReply = faqs[3].a
    } else if (userMessage.includes('payment') || userMessage.includes('pay')) {
      botReply = faqs[4].a
    } else if (userMessage.includes('approv') || userMessage.includes('signup')) {
      botReply = faqs[5].a
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { type: 'bot', text: botReply }])
    }, 300)

    setChatInput('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md sticky top-0 z-10" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Home Offer</h1>
          <Link
            href="/login"
            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 rounded px-3 py-2 transition"
            aria-label="Sign in to your account"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            The Transparent Real Estate Offer Marketplace
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-12">
            Clear bidding. Simple rules. Fair competition.
          </p>

          {/* One Big Get Started Button */}
          <Link
            href="/signup"
            className="inline-block bg-white text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-lg text-lg sm:text-2xl transition transform hover:scale-105 active:scale-95"
            aria-label="Get started with Home Offer"
          >
            Get Started →
          </Link>
        </div>

        {/* How It Works */}
        <section className="bg-white/10 backdrop-blur-md py-12 sm:py-16" aria-labelledby="how-it-works">
          <div className="max-w-6xl mx-auto px-4">
            <h3 id="how-it-works" className="text-2xl sm:text-3xl font-bold text-white mb-8 sm:mb-12 text-center">
              How It Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-white">
              <div className="bg-white/10 rounded-lg p-4 sm:p-6">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">1️⃣</div>
                <h4 className="font-bold text-base sm:text-lg mb-2">Post</h4>
                <p className="text-sm sm:text-base text-blue-100">Listing agent posts property with starting offer</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 sm:p-6">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">2️⃣</div>
                <h4 className="font-bold text-base sm:text-lg mb-2">Approve</h4>
                <p className="text-sm sm:text-base text-blue-100">Agent approves qualified buyers</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 sm:p-6">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">3️⃣</div>
                <h4 className="font-bold text-base sm:text-lg mb-2">Bid</h4>
                <p className="text-sm sm:text-base text-blue-100">Buyers submit offers ($1,000 increments)</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 sm:p-6">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">4️⃣</div>
                <h4 className="font-bold text-base sm:text-lg mb-2">Win</h4>
                <p className="text-sm sm:text-base text-blue-100">Highest offer wins after 12 days</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4">
            <h3 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-white mb-8 sm:mb-12 text-center">
              Frequently Asked Questions
            </h3>

            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="bg-white/10 rounded-lg p-4 sm:p-5 cursor-pointer hover:bg-white/20 transition focus-within:ring-2 focus-within:ring-white"
                >
                  <summary className="text-white font-bold text-base sm:text-lg flex justify-between items-center cursor-pointer select-none">
                    {faq.q}
                    <span className="ml-4 flex-shrink-0" aria-hidden="true">+</span>
                  </summary>
                  <p className="text-blue-100 mt-3 sm:mt-4 text-sm sm:text-base">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Chatbot */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="bg-white text-indigo-600 font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-full shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition text-base sm:text-lg min-h-12 min-w-12"
            aria-label="Open chatbot for questions"
          >
            💬
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-2xl w-full sm:w-96 max-w-sm flex flex-col h-96">
            {/* Chat Header */}
            <div className="bg-indigo-600 text-white p-3 sm:p-4 rounded-t-lg flex justify-between items-center">
              <h4 className="font-bold text-sm sm:text-base">Home Offer Assistant</h4>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white hover:bg-indigo-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close chatbot"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3" role="log" aria-label="Chat messages">
              {chatMessages.length === 0 && (
                <div className="text-gray-500 text-xs sm:text-sm">
                  <p className="font-bold mb-2">👋 Ask me about:</p>
                  <ul className="text-xs space-y-1">
                    <li>• How it works</li>
                    <li>• Who can use it</li>
                    <li>• Offer increments</li>
                    <li>• The 12-day period</li>
                    <li>• Payments</li>
                    <li>• Getting approved</li>
                  </ul>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 sm:p-3 rounded text-sm sm:text-base ${
                    msg.type === 'user'
                      ? 'bg-indigo-600 text-white ml-auto w-fit max-w-xs'
                      : 'bg-gray-100 text-gray-800 mr-auto w-fit max-w-xs'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleChatSubmit} className="border-t p-3 sm:p-4 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask..."
                className="flex-1 border rounded px-2 sm:px-3 py-1 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                aria-label="Chat input"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-3 py-1 sm:py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 text-sm font-medium"
                aria-label="Send message"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 sm:py-8 mt-12 sm:mt-16" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4 text-center text-blue-100 text-sm sm:text-base">
          <p className="mb-4">&copy; 2026 Home Offer. Transparent bidding for real estate.</p>
          <div className="flex justify-center items-center gap-2">
            <span className="text-xs">ADA Compliant</span>
            <span role="img" aria-label="Accessibility symbol">♿</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
