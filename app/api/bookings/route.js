import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { sendBookingReceivedEmail } from '@/lib/sendbookingreceivedemail'
import { sendBookingDecisionEmail } from '@/lib/sendBookingDecisionEmail'

function authorized(request) {
  const key =
    request.headers.get('x-admin-key') ||
    new URL(request.url).searchParams.get('adminKey')

  return Boolean(process.env.ADMIN_KEY) && key === process.env.ADMIN_KEY
}

// =======================================
// CREATE BOOKING
// =======================================
export async function POST(request) {
  try {
    console.log("POST /api/bookings reached")

    const booking = await request.json()

    console.log("BOOKING DATA:", booking)

    if (!booking.name || !booking.email) {
      return NextResponse.json(
        {
          error: "Customer name and email are required."
        },
        { status: 400 }
      )
    }

    const token = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "")

    const supabase = getSupabaseServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Please sign in before making a booking."
        },
        { status: 401 }
      )
    }

    if (user.email !== booking.email) {
      return NextResponse.json(
        {
          error: "Booking email does not match the signed in user."
        },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        branch: booking.branch,
        checkin: booking.checkin,
        checkout: booking.checkout,

        // Maps frontend fields
        room_type: booking.room,
        guests: booking.guests,
        food: booking.food,
        payment_method: booking.payment,

        status: booking.status || "Pending",
        created_at: booking.created,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase INSERT Error:", error)

      return NextResponse.json(
        {
          error: error.message,
          details: error,
        },
        { status: 500 }
      )
    }

    // Do not make the guest wait for email delivery before showing confirmation.
    void sendBookingReceivedEmail(data).catch(emailError => {
      console.error("Booking email error:", emailError)
    })

    return NextResponse.json(
      {
        booking: data,
        message: "Booking created successfully."
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("POST /api/bookings Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create booking."
      },
      { status: 500 }
    )
  }
}

// =======================================
// LOAD BOOKINGS (ADMIN)
// =======================================
export async function GET(request) {

  if (!authorized(request)) {
    return NextResponse.json(
      {
        error: "Invalid admin key."
      },
      { status: 401 }
    )
  }

  try {

    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({
      bookings: data
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "Could not load bookings."
      },
      { status: 500 }
    )
  }
}

// =======================================
// CONFIRM / REJECT BOOKING
// =======================================
export async function PATCH(request) {

  if (!authorized(request)) {
    return NextResponse.json(
      {
        error: "Invalid admin key."
      },
      { status: 401 }
    )
  }

  try {

    const { id, status } = await request.json()

    if (!id || !["Confirmed", "Rejected"].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid booking status."
        },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()

    const { data: booking, error } = await supabase
      .from("bookings")
      .update({
        status
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    let emailWarning = ''
    try {
      await sendBookingDecisionEmail(booking)
    } catch (emailError) {
      console.error('Booking decision email error:', emailError)
      emailWarning = 'Booking status was updated, but the customer email could not be sent.'
    }

    return NextResponse.json({
      booking,
      message: emailWarning || `Booking ${status.toLowerCase()} successfully and customer notified.`,
      error: emailWarning || undefined,
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update booking."
      },
      { status: 500 }
    )
  }
}
