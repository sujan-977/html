import { resend } from "@/lib/resend";

export async function sendBookingReceivedEmail(booking) {
  await resend.emails.send({
    from: "Atithi Restro <onboarding@resend.dev>", // Replace with your verified domain later
    to: booking.email,
    subject: "Booking Request Received – Atithi Restro & Lodge",

    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2>Booking Request Received</h2>

        <p>Dear <strong>${booking.name}</strong>,</p>

        <p>
          Thank you for choosing
          <strong>Atithi Restro & Lodge</strong>.
        </p>

        <p>
          Your booking request has been received successfully.
        </p>

        <table style="border-collapse:collapse;margin-top:15px">
          <tr>
            <td><strong>Booking ID:</strong></td>
            <td>${booking.id}</td>
          </tr>

          <tr>
            <td><strong>Branch:</strong></td>
            <td>${booking.branch}</td>
          </tr>

          <tr>
            <td><strong>Check-in:</strong></td>
            <td>${booking.checkin}</td>
          </tr>

          <tr>
            <td><strong>Check-out:</strong></td>
            <td>${booking.checkout}</td>
          </tr>

          <tr>
            <td><strong>Room:</strong></td>
            <td>${booking.room_type}</td>
          </tr>
        </table>

        <p style="margin-top:20px">
          Our team will review your booking shortly.
        </p>

        <p>
          You will receive another email once your reservation has been confirmed.
        </p>

        <br>

        <p>
          Thank you,<br>
          <strong>Atithi Restro & Lodge</strong><br>
          Atithi Devo Bhava
        </p>
      </div>
    `,
  });
}