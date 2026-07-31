import { resend } from '@/lib/resend'

const sender = `Atithi Restro & Lodge <${process.env.RESEND_FROM || 'bookings@atithi.sujan-katuwal.com.np'}>`

function itemsRows(items) {
  return (items || [])
    .map(item => `<tr><td>${item.name}</td><td>× ${item.qty}</td><td>NPR ${item.total}</td></tr>`)
    .join('')
}

export async function sendOrderReceivedEmail(order) {
  try {
    const { error } = await resend.emails.send({
      from: sender,
      to: order.email,
      subject: 'Food order received – confirmation pending',
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>Food Order Received</h2>
          <p>Thank you for your pre-order with <strong>Atithi Restro & Lodge</strong>.</p>
          <p>We have received your order and it is pending confirmation from our team.</p>
          <table style="border-collapse:collapse;margin-top:15px;width:100%;max-width:420px">
            <tr><td><strong>Order ID:</strong></td><td>${order.id}</td></tr>
          </table>
          <table style="border-collapse:collapse;margin-top:15px;width:100%;max-width:420px">
            <thead><tr><th align="left">Item</th><th align="left">Qty</th><th align="left">Price</th></tr></thead>
            <tbody>${itemsRows(order.items)}</tbody>
          </table>
          <p style="margin-top:15px"><strong>Total: NPR ${order.total}</strong></p>
          <p style="margin-top:20px">You will receive another email once your order has been confirmed.</p>
          <br>
          <p>
            Thank you,<br>
            <strong>Atithi Restro & Lodge</strong><br>
            Atithi Devo Bhava
          </p>
        </div>
      `,
    })

    if (error) throw new Error(error.message)
  } catch (error) {
    console.error('Order received email error:', error)
    throw error
  }
}
