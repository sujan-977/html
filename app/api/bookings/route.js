import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { sendBookingDecisionEmail } from '@/lib/booking-email'

function authorized(request) {
  const key =
    request.headers.get('x-admin-key') ||
    new URL(request.url).searchParams.get('adminKey')

  return Boolean(process.env.ADMIN_KEY) && key === process.env.ADMIN_KEY
}

// =========================
// CREATE BOOKING
// =========================
export async function POST(request) {
  try {
    console.log("POST /api/bookings reached")
    const booking = await request.json()

    console.log("BOOKING DATA:", booking)

    if (!booking?.name || !booking?.email) {
      return NextResponse.json(
        {
          error: 'Booking ID, customer name and email are required.',
        },
        { status: 400 }
      )
    }

    const token = request.headers
      .get('authorization')
      ?.replace(/^Bearer\s+/i, '')

    const supabase = getSupabaseServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'Please sign in before making a booking.',
        },
        { status: 401 }
      )
    }

    if (user.email !== booking.email) {
      return NextResponse.json(
        {
          error: 'Booking email does not match the logged in account.',
        },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
  .from('bookings')
  .insert({
    
    user_id: user.id,
    name: booking.name,
    phone: booking.phone,
    email: booking.email,
    branch: booking.branch,
    checkin: booking.checkin,
    checkout: booking.checkout,
    room_type: booking.room_type,
    guests: booking.guests,
    payment_method: booking.payment_method,
    status: booking.status,
    created_at: booking.created_at,
  })
  .select()
  .single()

    if (error) {
  console.error('Supabase INSERT Error:', error)
  return NextResponse.json(
    {
      error: error.message,
      details: error
    },
    { status: 500 }
  )
}

    return NextResponse.json(
      {
        booking: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/bookings Error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create booking.',
      },
      { status: 500 }
    )
  }
}

// =========================
// LOAD BOOKINGS (ADMIN)
// =========================
export async function GET(request) {
  if (!authorized(request)) {
    return NextResponse.json(
      {
        error: 'Invalid admin key.',
      },
      { status: 401 }
    )
  }

  try {
    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase SELECT Error:', error)
      throw error
    }

    return NextResponse.json({
      bookings: data,
    })
  } catch (error) {
    console.error('GET /api/bookings Error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Could not load bookings.',
      },
      { status: 500 }
    )
  }
}

// =========================
// CONFIRM / REJECT BOOKING (ADMIN)
// =========================
export async function PATCH(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Invalid admin key.' }, { status: 401 })
  }

  try {
    const { id, status } = await request.json()
    if (!id || !['Confirmed', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'A booking ID and a valid decision are required.' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    const { data: booking, error: updateError } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    try {
      await sendBookingDecisionEmail(booking, status)
    } catch (emailError) {
      console.error('Booking decision email error:', emailError)
      return NextResponse.json(
        { booking, error: `Booking ${status.toLowerCase()}, but the customer email could not be sent: ${emailError.message}` },
        { status: 502 }
      )
    }

    return NextResponse.json({ booking, message: `Booking ${status.toLowerCase()} and customer notified.` })
  } catch (error) {
    console.error('PATCH /api/bookings Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not update the booking.' },
      { status: 500 }
    )
  }
}
// confirmation email sending
import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req) {

    const body = await req.json();

    const supabase = getSupabaseServerClient();

    await supabase
      .from("bookings")
      .update({
        status:"Confirmed"
      })
      .eq("id", body.bookingId);

    await resend.emails.send({
      from:"Atithi Restro <booking@yourdomain.com>",
      to: body.email,
      subject:"Your booking has been confirmed!",
      html: `
        <h2>Hello ${body.name},</h2>

        <p>Your booking has been confirmed.</p>

        <ul>
          <li>Room: ${body.room}</li>
          <li>Check-in: ${body.checkin}</li>
          <li>Check-out: ${body.checkout}</li>
        </ul>

        <p>Thank you for choosing Atithi Restro & Lodge.</p>
      `
    });

    return NextResponse.json({
      success:true
    });
}