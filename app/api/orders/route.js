import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { isAdminRequest } from '@/lib/admin-auth';
import { sendOrderReceivedEmail } from '@/lib/sendOrderReceivedEmail';
import { sendOrderDecisionEmail } from '@/lib/sendOrderDecisionEmail';
import { sendAdminOrderNotification } from '@/lib/sendAdminOrderNotification';

// =======================================
// CREATE FOOD ORDER
// =======================================
export async function POST(request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const total = Number(body.total);

    if (!body.email || items.length === 0) {
      return NextResponse.json({ error: 'Order items and email are required.' }, { status: 400 });
    }
    if (!Number.isFinite(total) || total < 0) {
      return NextResponse.json({ error: 'Invalid order total.' }, { status: 400 });
    }

    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const supabase = getSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Please sign in before placing an order.' }, { status: 401 });
    }
    if (user.email !== body.email) {
      return NextResponse.json({ error: 'Order email does not match the signed in user.' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('food_orders')
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        email: body.email,
        items,
        total,
        status: 'Pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Do not make the guest wait for email delivery before showing confirmation.
    void sendOrderReceivedEmail(data).catch(emailError => {
      console.error('Order received email error:', emailError);
    });
    void sendAdminOrderNotification(data).catch(emailError => {
      console.error('Admin order notification error:', emailError);
    });

    return NextResponse.json({ order: data, message: 'Order placed successfully.' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders Error:', error);
    return NextResponse.json({ error: error.message || 'Could not place order.' }, { status: 500 });
  }
}

// =======================================
// LOAD ORDERS (ADMIN)
// =======================================
export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Invalid admin key.' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('food_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ orders: data });
  } catch (error) {
    console.error('GET /api/orders Error:', error);
    return NextResponse.json({ error: 'Could not load orders.' }, { status: 500 });
  }
}

// =======================================
// CONFIRM / REJECT ORDER
// =======================================
export async function PATCH(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Invalid admin key.' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !['Confirmed', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid order status.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: order, error } = await supabase
      .from('food_orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    let emailWarning = '';
    try {
      await sendOrderDecisionEmail(order);
    } catch (emailError) {
      console.error('Order decision email error:', emailError);
      emailWarning = 'Order status was updated, but the customer email could not be sent.';
    }

    return NextResponse.json({
      order,
      message: emailWarning || `Order ${status.toLowerCase()} successfully and customer notified.`,
      error: emailWarning || undefined,
    });
  } catch (error) {
    console.error('PATCH /api/orders Error:', error);
    return NextResponse.json({ error: error.message || 'Could not update order.' }, { status: 500 });
  }
}
