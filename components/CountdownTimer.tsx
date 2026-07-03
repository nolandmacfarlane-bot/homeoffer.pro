'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  endDate: string
  size?: 'small' | 'large'
}

export default function CountdownTimer({ endDate, size = 'large' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })

  useEffect(() => {
    function updateCountdown() {
      const now = new Date()
      const end = new Date(endDate)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  if (timeLeft.isExpired) {
    return (
      <div className={size === 'large' ? 'text-2xl font-bold text-red-600' : 'text-sm font-semibold text-red-600'}>
        ⏱️ Bidding Closed
      </div>
    )
  }

  if (size === 'small') {
    return (
      <div className="text-sm font-semibold text-orange-600">
        ⏰ {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Time Remaining</p>
        <div className="grid grid-cols-4 gap-2">
          {/* Days */}
          <div className="bg-indigo-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-indigo-600">{String(timeLeft.days).padStart(2, '0')}</p>
            <p className="text-xs text-indigo-700 font-semibold mt-1">DAYS</p>
          </div>

          {/* Hours */}
          <div className="bg-indigo-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-indigo-600">{String(timeLeft.hours).padStart(2, '0')}</p>
            <p className="text-xs text-indigo-700 font-semibold mt-1">HOURS</p>
          </div>

          {/* Minutes */}
          <div className="bg-indigo-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-indigo-600">{String(timeLeft.minutes).padStart(2, '0')}</p>
            <p className="text-xs text-indigo-700 font-semibold mt-1">MIN</p>
          </div>

          {/* Seconds */}
          <div className="bg-indigo-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-indigo-600">{String(timeLeft.seconds).padStart(2, '0')}</p>
            <p className="text-xs text-indigo-700 font-semibold mt-1">SEC</p>
          </div>
        </div>
      </div>

      {/* Auto-extend warning */}
      {timeLeft.minutes <= 15 && timeLeft.days === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 text-center">
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ Last 15 Minutes! Offers now auto-extend by 15 mins
          </p>
        </div>
      )}
    </div>
  )
}
