import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { isAdminRequest } from '@/lib/admin-auth';

function roomPayload(input) {
  const name = String(input.name || '').trim();
  const price = Number(input.price);
  if (!name || !Number.isFinite(price) || price < 0) return null;
  return {
    name,
    price,
    description: String(input.description || '').trim() || null,
    image_url: String(input.image_url || '').trim() || null,
    capacity: String(input.capacity || '').trim() || null,
    amenities: Array.isArray(input.amenities) ? input.amenities.map(item => String(item).trim()).filter(Boolean) : [],
    is_available: input.is_available !== false,
    updated_at: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const rooms = (data || []).map(room => ({
      ...room,
      amenities: Array.isArray(room.amenities) ? room.amenities : [],
    }));
    return NextResponse.json({ rooms });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not load rooms.' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const payload = roomPayload(await request.json());
    if (!payload) return NextResponse.json({ error: 'A room name and valid nightly price are required.' }, { status: 400 });
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('rooms').insert(payload).select().single();
    if (error) throw error;
    return NextResponse.json({ room: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not add room.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const input = await request.json();
    if (!input.id) return NextResponse.json({ error: 'Room ID is required.' }, { status: 400 });
    const payload = roomPayload(input);
    if (!payload) return NextResponse.json({ error: 'A room name and valid nightly price are required.' }, { status: 400 });
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('rooms').update(payload).eq('id', input.id).select().single();
    if (error) throw error;
    return NextResponse.json({ room: data });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not update room.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Room ID is required.' }, { status: 400 });
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not delete room.' }, { status: 500 });
  }
}
