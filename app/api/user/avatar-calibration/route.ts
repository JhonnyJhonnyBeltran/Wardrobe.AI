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

    const { data: profile, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({
        physical_profile: null,
      });
    }

    const notifPrefs = (profile as any).notification_preferences || {};
    const storedPhysical = notifPrefs.physical_profile || {};

    const gender = profile.gender || storedPhysical.gender || 'woman';
    const height = profile.height || storedPhysical.height || 170;
    const body_type = profile.body_shape || profile.morphology || storedPhysical.body_type || '';
    const eye_color = profile.eye_color || storedPhysical.eye_color || '';
    const hair_color = profile.hair_color || storedPhysical.hair_color || '';

    return NextResponse.json({
      physical_profile: {
        gender,
        height,
        body_type,
        eye_color,
        hair_color,
      },
    });
  } catch (err: any) {
    console.error('[PhysicalProfile] GET error:', err);
    return NextResponse.json({ error: err.message || 'Error al obtener perfil físico' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client, user } = await resolveUserAndClient(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    const { data: currentProfile } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const currentNotifs = (currentProfile as any)?.notification_preferences || {};
    const existingPhysical = currentNotifs.physical_profile || {};

    const gender = body.gender || existingPhysical.gender || currentProfile?.gender || 'woman';
    const height = typeof body.height === 'number' ? body.height : (Number(body.height) || existingPhysical.height || currentProfile?.height || 170);
    const body_type = body.body_type ?? body.bodyType ?? existingPhysical.body_type ?? currentProfile?.body_shape ?? '';
    const eye_color = body.eye_color ?? body.eyeColor ?? existingPhysical.eye_color ?? '';
    const hair_color = body.hair_color ?? body.hairColor ?? existingPhysical.hair_color ?? '';

    const physicalProfilePayload = {
      gender,
      height,
      body_type,
      eye_color,
      hair_color,
      updated_at: new Date().toISOString(),
    };

    const updatedNotifs = {
      ...currentNotifs,
      physical_profile: physicalProfilePayload,
      // Clear legacy biometric photo arrays for GDPR privacy compliance
      avatar_calibration: undefined,
    };

    // Attempt full column + JSONB update
    const fullPayload: Record<string, any> = {
      gender,
      height,
      body_shape: body_type,
      morphology: body_type,
      face_photos: [],
      body_photos: [],
      notification_preferences: updatedNotifs,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await (client.from('profiles') as any)
      .update(fullPayload)
      .eq('id', user.id);

    if (updateError) {
      // Safe fallback if optional columns don't exist in schema
      const { error: fallbackError } = await (client.from('profiles') as any)
        .update({
          gender,
          notification_preferences: updatedNotifs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (fallbackError) {
        await (client.from('profiles') as any)
          .update({
            notification_preferences: updatedNotifs,
          })
          .eq('id', user.id);
      }
    }

    return NextResponse.json({
      success: true,
      physical_profile: physicalProfilePayload,
      message: 'Perfil físico guardado correctamente',
    });
  } catch (err: any) {
    console.error('[PhysicalProfile] POST error:', err);
    return NextResponse.json({ error: err.message || 'Error al guardar perfil físico' }, { status: 500 });
  }
}
