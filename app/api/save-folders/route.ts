import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Helper to authenticate user and select appropriate database client
async function getDbClient(request: NextRequest) {
  let user: any = null;
  let client: any = null;

  // 1. Check Bearer token from header
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  let token: string | null = null;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim();
  }

  // If token is provided, verify it and create a scoped client
  if (token) {
    try {
      const anonClient = createAdminClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { data } = await anonClient.auth.getUser(token);
      if (data?.user) {
        user = data.user;
        client = createAdminClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false }
        });
      }
    } catch (e) {
      console.warn('[api/save-folders] Error authenticating with Bearer token:', e);
    }
  }

  // 2. If no user from token, check cookies via SSR createClient()
  if (!user) {
    try {
      const supabaseServer = await createClient();
      const { data } = await supabaseServer.auth.getUser();
      if (data?.user) {
        user = data.user;
        client = supabaseServer;
      }
    } catch (e) {
      console.warn('[api/save-folders] Error authenticating with server cookies:', e);
    }
  }

  // 3. If service role key is available in environment, use it for complete bypass of RLS issues
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (serviceKey) {
    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    client = admin;
  }

  // Fallback: if client still null, create fallback anon client
  if (!client) {
    client = createAdminClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  return { client, user };
}

export async function GET(request: NextRequest) {
  try {
    const { client, user } = await getDbClient(request);

    if (!user) {
      return NextResponse.json({ folders: [] }, { status: 401 });
    }

    const { data: folders, error } = await client
      .from('save_folders')
      .select('*, save_folder_items(saves(posts(image_url)))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback to simple select if join fails
      const { data: simpleFolders } = await client
        .from('save_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      return NextResponse.json({ folders: simpleFolders || [] });
    }

    const enhancedFolders = (folders || []).map((folder: any) => {
      let preview_images: string[] = [];
      if (folder.save_folder_items) {
        const allImages = folder.save_folder_items
          .map((item: any) => item.saves?.posts?.image_url)
          .filter(Boolean);
        preview_images = allImages.slice(0, 4);
      }
      return {
        ...folder,
        preview_images,
        save_folder_items: undefined
      };
    });

    return NextResponse.json({ folders: enhancedFolders });
  } catch (error: any) {
    console.error('[api/save-folders] GET error:', error);
    return NextResponse.json({ folders: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client, user } = await getDbClient(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, color } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const { data, error } = await client
      .from('save_folders')
      .insert({
        user_id: user.id,
        name: name.trim().slice(0, 50),
        icon: icon || null,
        color: color || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ folder: data });
  } catch (error: any) {
    console.error('[api/save-folders] POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { client, user } = await getDbClient(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, icon, color } = body;

    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    // Explicit IDOR check
    const { data: existing } = await client
      .from('save_folders')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined && typeof name === 'string') updateData.name = name.trim().slice(0, 50);
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from('save_folders')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ folder: data });
  } catch (error: any) {
    console.error('[api/save-folders] PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { client, user } = await getDbClient(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    // Explicit IDOR check: Verify folder belongs to authenticated caller
    const { data: existing } = await client
      .from('save_folders')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Find all save IDs in this folder
    const { data: folderItems } = await client
      .from('save_folder_items')
      .select('save_id')
      .eq('folder_id', id);

    const saveIds = (folderItems || []).map((fi: any) => fi.save_id).filter(Boolean);

    // 2. Delete linkages
    try {
      await client.from('save_folder_items').delete().eq('folder_id', id);
    } catch (e) {
      console.warn('[api/save-folders] Non-fatal deleting linkages:', e);
    }

    // 3. Delete the actual saves for this user
    if (saveIds.length > 0) {
      try {
        await client.from('saves').delete().in('id', saveIds).eq('user_id', user.id);
      } catch (e) {
        console.warn('[api/save-folders] Non-fatal deleting saves:', e);
      }
    }

    // 4. Delete the folder ensuring user_id match
    await client.from('save_folders').delete().eq('id', id).eq('user_id', user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[api/save-folders] DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
