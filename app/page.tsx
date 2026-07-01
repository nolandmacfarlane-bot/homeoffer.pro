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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Home Offer</h1>
          <Link
            href="/login"
            className="text-white hover:text-gray-200 transition"
          >
            Already have account? Sign in
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-6xl font-bold text-white mb-6">
          The Transparent Real Estate Offer Marketplace
        </h2>
        <p className="text-2xl text-blue-100 mb-12">
          Clear bidding. Simple rules. Fair competition.
        </p>

        {/* One Big Get Started Button */}
        <Link
          href="/signup"
          className="inline-block bg-white text-indigo-600 hover:bg-gray-100 font-bold py-4 px-12 rounded-lg text-2xl transition transform hover:scale-105 mb-16"
        >
          Get Started →
        </Link>

        {/* How It Works */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 mb-16">
          <h3 className="text-3xl font-bold text-white mb-6">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
            <div>
              <div className="text-5xl mb-2">1️⃣</div>
              <p className="font-bold">Post</p>
              <p className="text-sm text-blue-100">Listing agent posts property with starting offer</p>
            </div>
            <div>
              <div className="text-5xl mb-2">2️⃣</div>
              <p className="font-bold">Approve</p>
              <p className="text-sm text-blue-100">Agent approves qualified buyers</p>
            </div>
            <div>
              <div className="text-5xl mb-2">3️⃣</div>
              <p className="font-bold">Bid</p>
              <p className="text-sm text-blue-100">Buyers submit offers ($1,000 increments)</p>
            </div>
            <div>
              <div className="text-5xl mb-2">4️⃣</div>
              <p className="font-bold">Win</p>
              <p className="text-sm text-blue-100">Highest offer wins after 12 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white/5 backdrop-blur-md py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="bg-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/20 transition"
              >
                <summary className="text-white font-bold text-lg flex justify-between items-center">
                  {faq.q}
                  <span className="ml-4">+</span>
                </summary>
                <p className="text-blue-100 mt-4 text-lg">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="bg-white text-indigo-600 font-bold py-4 px-6 rounded-full shadow-lg hover:scale-110 transition text-xl"
          >
            💬 Questions?
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-2xl w-96 flex flex-col h-96">
            {/* Chat Header */}
            <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h4 className="font-bold">Home Offer Assistant</h4>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white hover:bg-indigo-700 p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-gray-500 text-sm">
                  <p className="font-bold mb-2">👋 Hi! Ask me about:</p>
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
                  className={`p-2 rounded ${
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
            <form onSubmit={handleChatSubmit} className="border-t p-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 border rounded px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-blue-100">
          <p>&copy; 2026 Home Offer. Transparent bidding for real estate.</p>
        </div>
      </footer>
    </div>
  )
}
