import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

await fetch("/api/bookings/accept", {
  method: "POST",
  body: JSON.stringify({
    bookingId: booking.id
  })
})

await fetch("/api/bookings/accept", {
  method: "POST",
  headers:{
    "Content-Type":"application/json"
  },
  body: JSON.stringify({
    bookingId: booking.id,
    email: booking.email,
    name: booking.name,
    room: booking.room_type,
    checkin: booking.checkin,
    checkout: booking.checkout
  })
})