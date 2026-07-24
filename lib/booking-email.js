import { resend } from "@/lib/resend";

export async function sendBookingDecisionEmail(booking, status) {
  const confirmed = status === "Confirmed";

  const subject = confirmed
    ? `Booking Confirmed — ${booking.id}`
    : `Booking Request Declined — ${booking.id}`;

  const stay = `${booking.checkin} to ${booking.checkout}`;

  const message = confirmed
    ? "Great news! Your booking at Atithi Restro & Lodge has been confirmed."
    : "We are sorry, but we are are unable to accept your booking request at this time.";

  await resend.emails.send({
    from: "Atithi Restro <onboarding@resend.dev>", // Change this to your verified domain later
    to: