import { subscribe } from '../store'

function authorized(request) {
  const key = request.headers.get('x-admin-key') || new URL(request.url).searchParams.get('adminKey')
  return Boolean(process.env.ADMIN_KEY) && key === process.env.ADMIN_KEY
}

export function GET(request) {
  if (!authorized(request)) return new Response('Invalid admin key.', { status: 401 })

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
