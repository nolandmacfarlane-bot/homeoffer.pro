import Link from 'next/link'
import type { ReactNode } from 'react'
import { secondaryButton } from '@/lib/ui-styles'

type BackButtonProps = {
  href: string
  children?: ReactNode
  className?: string
}

export default function BackButton({ href, children = 'Back', className = '' }: BackButtonProps) {
  return (
    <Link href={href} className={`${secondaryButton} text-blue-700 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="m11 18-6-6 6-6" />
      </svg>
      <span>{children}</span>
    </Link>
  )
}
