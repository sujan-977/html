import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { isAdminRequest } from '@/lib/admin-auth';

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    if (!(file instanceof File) || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Please choose an image file.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 400 });
    const extension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'jpg';
    const path = `${crypto.randomUUID()}.${extension}`;
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.storage.from('room-images').upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('room-images').getPublicUrl(path);
    return NextResponse.json({ image_url: data.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not upload image.' }, { status: 500 });
  }
}
