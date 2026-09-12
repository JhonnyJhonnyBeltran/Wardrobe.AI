import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                   process.env.SUPABASE_SERVICE_KEY || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getAdmin = () => createAdminClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function resolveUserAndClient(request: NextRequest) {
  let user: any = null;
  let supabaseServerClient: any = null;

  try {
    supabaseServerClient = await createClient();
    const { data } = await supabaseServerClient.auth.getUser();
    user = data?.user || null;
  } catch {}

  if (!user) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '').trim();
        const admin = getAdmin();
        const { data } = await admin.auth.getUser(token);
        if (data?.user) {
          user = data.user;
        }
      } catch {}
    }
  }

  const hasServiceRole = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
  const client = hasServiceRole ? getAdmin() : (supabaseServerClient || getAdmin());

  return { client, user };
}

export async function GET(request: NextRequest) {
  try {
    const { client, user } = await resolveUserAndClient(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Try reading profile with face_photos, body_photos, and notification_preferences
    const { data: profile, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({ face_photos: [], body_photos: [] });
    }

    let facePhotos: string[] = (profile as any).face_photos || [];
    let bodyPhotos: string[] = (profile as any).body_photos || [];

    // Fallback to JSONB storage inside notification_preferences / preferences if array is empty
    if (facePhotos.length === 0 && bodyPhotos.length === 0) {
      const notifPrefs = (profile as any).notification_preferences || {};
      if (notifPrefs.avatar_calibration) {
        facePhotos = notifPrefs.avatar_calibration.face_photos || [];
        bodyPhotos = notifPrefs.avatar_calibration.body_photos || [];
      }
    }

    return NextResponse.json({
      face_photos: facePhotos.filter(Boolean),
      body_photos: bodyPhotos.filter(Boolean),
    });
  } catch (err: any) {
    console.error('[AvatarCalibration] GET error:', err);
    return NextResponse.json({ error: err.message || 'Error al obtener fotos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client, user } = await resolveUserAndClient(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const facePhotos: string[] = (body.face_photos || []).filter(Boolean);
    const bodyPhotos: string[] = (body.body_photos || []).filter(Boolean);

    // 1. Fetch current notification_preferences to safely inject backup
    const { data: currentProfile } = await client
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .maybeSingle();

    const currentNotifs = (currentProfile as any)?.notification_preferences || {};
    const updatedNotifs = {
      ...currentNotifs,
      avatar_calibration: {
        face_photos: facePhotos,
        body_photos: bodyPhotos,
        updated_at: new Date().toISOString()
      }
    };

    // 2. First attempt: update both columns AND backup JSONB
    let updatePayload: any = {
      face_photos: facePhotos,
      body_photos: bodyPhotos,
      notification_preferences: updatedNotifs,
      updated_at: new Date().toISOString()
    };

    let { error: updateError } = await (client.from('profiles') as any)
      .update(updatePayload)
      .eq('id', user.id);

    // If column face_photos does not exist in schema yet, fallback to JSONB only
    if (updateError) {
      console.warn('[AvatarCalibration] Direct column update failed, saving in JSONB fallback:', updateError.message);
      const { error: fallbackError } = await (client.from('profiles') as any)
        .update({
          notification_preferences: updatedNotifs,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (fallbackError) {
        console.error('[AvatarCalibration] Fallback update failed:', fallbackError);
        throw fallbackError;
      }
    }

    return NextResponse.json({
      success: true,
      face_photos: facePhotos,
      body_photos: bodyPhotos,
      message: 'Fotos de calibración guardadas exitosamente'
    });
  } catch (err: any) {
    console.error('[AvatarCalibration] POST error:', err);
    return NextResponse.json({ error: err.message || 'Error al guardar fotos' }, { status: 500 });
  }
}
