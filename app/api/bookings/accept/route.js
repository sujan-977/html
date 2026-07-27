// confirmation email sending
import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const sender = `Atithi Restro & Lodge <${process.env.RESEND_FROM || 'bookings@atithi.sujan-katuwal.com.np'}>`;

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
      from: sender,
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
