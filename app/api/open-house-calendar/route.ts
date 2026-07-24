import { NextRequest } from 'next/server'

const escapeICS = (value: string) => value.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const title = params.get('title') || 'HomeOffer.pro Open House'
  const location = params.get('location') || ''
  const start = params.get('start')
  const end = params.get('end')

  if (!start || !end || !/^\d{8}T\d{6}Z$/.test(start) || !/^\d{8}T\d{6}Z$/.test(end)) {
    return new Response('Invalid calendar event', { status: 400 })
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HomeOffer.pro//Open House//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${start}-${encodeURIComponent(location)}@homeoffer.pro`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(title)}`,
    `LOCATION:${escapeICS(location)}`,
    `DESCRIPTION:${escapeICS('Open house listed on HomeOffer.pro')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="homeoffer-open-house.ics"',
    },
  })
}
