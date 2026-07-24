import nodemailer from 'nodemailer'

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || SMTP_PASS === 'your-app-password') {
    throw new Error('Email is not configured. Set valid SMTP_HOST, SMTP_USER, and SMTP_PASS values.')
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: SMTP_SECURE !== 'false',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

export async function sendBookingDecisionEmail(booking, status) {
  const confirmed = status === 'Confirmed'
  const subject = confirmed
    ? `Booking confirmed — ${booking.id}`
    : `Booking request declined — ${booking.id}`
  const stay = `${booking.checkin || 'your check-in date'} to ${booking.checkout || 'your check-out date'}`
  const message = confirmed
    ? `Great news! Your booking at Atithi Restro & Lodge has been confirmed.`
    : `We are sorry, but we are unable to accept your booking request at this time.`

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: booking.email,
    subject,
    text: `Hello ${booking.name},\n\n${message}\n\nBooking reference: ${booking.id}\nBranch: ${booking.branch || 'Atithi Restro & Lodge'}\nStay: ${stay}\nRoom: ${booking.room_type || 'Not specified'}\nGuests: ${booking.guests || 'Not specified'}\n\nPlease contact us if you have any questions.\n\nAtithi Restro & Lodge`,
    html: `<p>Hello ${booking.name},</p><p>${message}</p><p><strong>Booking reference:</strong> ${booking.id}<br><strong>Branch:</strong> ${booking.branch || 'Atithi Restro & Lodge'}<br><strong>Stay:</strong> ${stay}<br><strong>Room:</strong> ${booking.room_type || 'Not specified'}<br><strong>Guests:</strong> ${booking.guests || 'Not specified'}</p><p>Please contact us if you have any questions.</p><p>Atithi Restro &amp; Lodge</p>`,
  })
}
