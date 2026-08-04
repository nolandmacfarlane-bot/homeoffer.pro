const buttonBase =
  'inline-flex min-h-12 items-center justify-center gap-3 rounded-full border-2 px-6 py-3 text-base font-black leading-none transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50'

export const primaryButton = `${buttonBase} border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700`
export const secondaryButton = `${buttonBase} border-slate-300 bg-white text-slate-950 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700`
export const dangerButton = `${buttonBase} border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700 focus-visible:ring-red-200`

