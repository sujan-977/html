import { resend } from '@/lib/resend'

const sender = `Atithi Restro & Lodge <${process.env.RESEND_FROM || 'bookings@atithi.sujan-katuwal.com.np'}>`

function itemsRows(items) {
  return (items || [])
    .map(item => `<tr><td>${item.name}</td><td>× ${item.qty}</td><td>NPR ${item.total}</td></tr>`)
    .join('')
}

export async function sendAdminOrderNotification(order) {
  if (!process.env.ADMIN_EMAIL) return

  const { error } = await resend.emails.send({
    from: sender,
    to: process.env.ADMIN_EMAIL,
    subject: `New food pre-order — NPR ${order.total}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2>New Food Pre-Order</h2>
        <p>A new food order has been placed and is awaiting your decision.</p>
        <table style="border-collapse:collapse;margin-top:15px;width:100%;max-width:420px">
          <tr><td><strong>Order ID:</strong></td><td>${order.id}</td></tr>
          <tr><td><strong>Customer:</strong></td><td>${order.email}</td></tr>
        </table>
        <table style="border-collapse:collapse;margin-top:15px;width:100%;max-width:420px">
          <thead><tr><th align="left">Item</th><th align="left">Qty</th><th align="left">Price</th></tr></thead>
          <tbody>${itemsRows(order.items)}</tbody>
        </table>
        <p style="margin-top:15px"><strong>Total: NPR ${order.total}</strong></p>
        <p style="margin-top:20px">Review and accept or reject this order from the admin panel.</p>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
}
