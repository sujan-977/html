import { resend } from "@/lib/resend";

export async function sendBookingDecisionEmail(booking) {
  await resend.emails.send({
    from: "Atithi Restro <onboarding@resend.dev>",
    to: booking.email,
    subject: "Booking Request Received - Atithi Restro & Lodge",
    html: `
      <h2>Hello ${booking.name},</h2>

      <p>Thank you for choosing <strong>Atithi Restro & Lodge</strong>.</p>

      <p>Your booking request has been received successfully.</p>

      <p><strong>Booking Details:</strong></p>

      <ul>
        <li><strong>Booking ID:</strong> ${booking.id}</li>
        <li><strong>Branch:</strong> ${booking.branch}</li>
        <li><strong>Check-in:</strong> ${booking.checkin}</li>
        <li><strong>Check-out:</strong> ${booking.checkout}</li>
        <li><strong>Room:</strong> ${booking.room_type || booking.room}</li>
      </ul>

      <p>
        Our team will review your booking shortly.
        You will receive another email once your booking has been confirmed.
      </p>

      <p>We look forward to welcoming you.</p>

      <p>
        Regards,<br>
        <strong>Atithi Restro & Lodge</strong><br>
        <em>Atithi Devo Bhava</em>
      </p>
    `,
  });
}