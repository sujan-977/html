import { resend } from '@/lib/resend'

const sender = `Atithi Restro & Lodge <${process.env.RESEND_FROM || 'bookings@atithi.sujan-katuwal.com.np'}>`

function itemsRows(items) {
  return (items || [])
    .map(item => `<tr><td>${item.name}</td><td>× ${item.qty}</td><td>NPR ${item.total}</td></tr>`)
    .join('')
}

export async function sendOrderDecisionEmail(order) {
  const confirmed = order.status === 'Confirmed'
  const subject = confirmed
    ? 'Food order confirmed – Atithi Restro & Lodge'
    : 'Food order update – Atithi Restro & Lodge'
  const decisionMessage = confirmed
    ? 'Your food order has been confirmed. We look forward to serving you.'
    : 'Unfortunately, we are unable to fulfil your food order at this time.'

  const { error } = await resend.emails.send({
    from: sender,
    to: order.email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2>${confirmed ? 'Order Confirmed' : 'Order Update'}</h2>
        <p>${decisionMessage}</p>
        <table style="border-collapse:collapse;margin-top:15px;width:100%;max-width:420px">
          <tr><td><strong>Order ID:</strong></td><td>${order.id}</td></tr>
        </table>
        <table style="border-collapse:collapse;margin-top:15px;width:100%;max-width:420px">
          <thead><tr><th align="left">Item</th><th align="left">Qty</th><th align="left">Price</th></tr></thead>
          <tbody>${itemsRows(order.items)}</tbody>
        </table>
        <p style="margin-top:15px"><strong>Total: NPR ${order.total}</strong></p>
        <p style="margin-top:20px">Thank you for choosing <strong>Atithi Restro & Lodge</strong>.</p>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
}
