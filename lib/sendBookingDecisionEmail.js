import { resend } from '@/lib/resend'

const sender = `Atithi Restro & Lodge <${process.env.RESEND_FROM || 'bookings@atithi.sujan-katuwal.com.np'}>`

export async function sendBookingDecisionEmail(booking) {
  const confirmed = booking.status === 'Confirmed'
  const subject = confirmed
    ? 'Booking confirmed successfully – Atithi Restro & Lodge'
    : 'Booking update – Atithi Restro & Lodge'
  const decisionMessage = confirmed
    ? 'Your booking has been successfully confirmed. We look forward to welcoming you.'
    : 'Unfortunately, we are unable to confirm your booking request at this time.'

  const { error } = await resend.emails.send({
    from: sender,
    to: booking.email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2>${confirmed ? 'Booking Confirmed' : 'Booking Update'}</h2>
        <p>Hello <strong>${booking.name}</strong>,</p>
        <p>${decisionMessage}</p>
        <table style="border-collapse:collapse;margin-top:15px">
          <tr><td><strong>Booking ID:</strong></td><td>${booking.id}</td></tr>
          <tr><td><strong>Branch:</strong></td><td>${booking.branch}</td></tr>
          <tr><td><strong>Check-in:</strong></td><td>${booking.checkin}</td></tr>
          <tr><td><strong>Check-out:</strong></td><td>${booking.checkout}</td></tr>
          <tr><td><strong>Room:</strong></td><td>${booking.room_type}</td></tr>
        </table>
        <p style="margin-top:20px">Thank you for choosing <strong>Atithi Restro & Lodge</strong>.</p>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
}
