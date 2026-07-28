import { subscribe } from '../store'
import { isAdminRequest } from '@/lib/admin-auth'

export function GET(request) {
  if (!isAdminRequest(request)) return new Response('Unauthorized.', { status: 401 })

  const encoder = new TextEncoder()
  let unsubscribe
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('event: ready\ndata: connected\n\n'))
      unsubscribe = subscribe(booking => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(booking)}\n\n`))
      })
    },
    cancel() {
      unsubscribe?.()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
