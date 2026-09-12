import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getAdmin = () => createAdminClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Helper to authenticate user from cookies or Authorization Bearer token
async function resolveAuthUser(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
  } catch {}

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '').trim();
      const admin = getAdmin();
      const { data: { user } } = await admin.auth.getUser(token);
      if (user) return user;
    } catch {}
  }

  return null;
}

/**
 * GET /api/saves
 * Get all saved posts for the user, optionally filtered by folder
 */
export async function GET(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request);

    if (!user) {
      return NextResponse.json({ saves: [] }, { status: 401 });
    }

    const admin = getAdmin();
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folder_id');

    if (folderId) {
      // Validate that folder belongs to user
      const { data: folder } = await admin
        .from('save_folders')
        .select('id')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!folder) {
        return NextResponse.json({ saves: [] });
      }

      // Get saves in a specific folder
      const { data: folderItems } = await admin
        .from('save_folder_items')
        .select('save_id')
        .eq('folder_id', folderId);

      const saveIds = (folderItems || []).map(item => item.save_id);

      if (saveIds.length === 0) {
        return NextResponse.json({ saves: [] });
      }

      const { data: savesData } = await admin
        .from('saves')
        .select('*, posts(*)')
        .in('id', saveIds)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const saves = (savesData || []).map((save: any) => ({
        ...save,
        posts: save.posts
      })).filter((save: any) => save.posts);

      return NextResponse.json({ saves });
    } else {
      // Get all saves for this user
      const { data: savesData } = await admin
        .from('saves')
        .select('*, posts(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const saves = (savesData || []).map((save: any) => ({
        ...save,
        posts: save.posts
      })).filter((save: any) => save.posts);

      return NextResponse.json({ saves });
    }
  } catch (error: any) {
    console.error('Error in GET /api/saves:', error);
    return NextResponse.json({ saves: [] }, { status: 500 });
  }
}

/**
 * POST /api/saves
 * Save a post, optionally to a folder
 */
export async function POST(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdmin();
    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    let { post_id, folder_id } = body;
    if (!post_id) {
      const { searchParams } = new URL(request.url);
      post_id = searchParams.get('post_id');
      folder_id = searchParams.get('folder_id') || folder_id;
    }

    if (!post_id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // If folder_id is passed, verify user owns the folder
    if (folder_id) {
      const { data: folderDoc } = await admin
        .from('save_folders')
        .select('id')
        .eq('id', folder_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!folderDoc) {
        return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 403 });
      }
    }

    // Check if already saved
    const { data: existing, error: fetchError } = await admin
      .from('saves')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', post_id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing save:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existing) {
      if (folder_id) {
        // If they chose a folder but it was already quick-saved, assign it to the folder
        await admin.from('save_folder_items').delete().eq('save_id', existing.id);

        const { error: insertError } = await (admin.from('save_folder_items') as any).insert({ folder_id, save_id: existing.id });
        if (insertError) {
          if (insertError.code === '23505') {
            return NextResponse.json({ save: existing });
          }
          console.error('Error assigning to folder:', insertError);
          return NextResponse.json({ error: insertError.message, details: insertError }, { status: 500 });
        }
      }
      return NextResponse.json({ save: existing });
    }

    // Create the save
    const newId = randomUUID();
    const { data: save, error } = await (admin.from('saves') as any)
      .insert({
        id: newId,
        user_id: user.id,
        post_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ save: { post_id } });
      }
      console.error('Error saving post:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    // If folder_id is provided, add to folder
    if (folder_id) {
      await (admin.from('save_folder_items') as any)
        .insert({
          folder_id,
          save_id: save.id,
        });
    }

    return NextResponse.json({ save });
  } catch (error: any) {
    console.error('Error in POST /api/saves:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/saves
 * Unsave a post
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdmin();
    const { searchParams } = new URL(request.url);
    let saveId = searchParams.get('id');
    let postId = searchParams.get('post_id');

    if (!saveId && !postId) {
      try {
        const body = await request.json();
        saveId = body?.id || saveId;
        postId = body?.post_id || postId;
      } catch {}
    }

    if (!saveId && !postId) {
      return NextResponse.json({ error: 'Save ID or Post ID is required' }, { status: 400 });
    }

    // If postId provided, find saveId first to clean up folder items
    if (postId && !saveId) {
      const { data: foundSave } = await admin
        .from('saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();
      if (foundSave) {
        saveId = foundSave.id;
      }
    }

    let query = admin.from('saves').delete().eq('user_id', user.id);

    if (saveId) {
      query = query.eq('id', saveId);
    } else if (postId) {
      query = query.eq('post_id', postId);
    }

    await query;

    // Also remove from any folders
    if (saveId) {
      await admin
        .from('save_folder_items')
        .delete()
        .eq('save_id', saveId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/saves:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/saves
 * Move a saved post to a different folder
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdmin();
    const body = await request.json();
    const { save_id, folder_id } = body;

    if (!save_id) {
      return NextResponse.json({ error: 'Save ID is required' }, { status: 400 });
    }

    // Verify ownership of the save item
    const { data: saveDoc } = await admin
      .from('saves')
      .select('id, user_id')
      .eq('id', save_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!saveDoc) {
      return NextResponse.json({ error: 'Save item not found or forbidden' }, { status: 403 });
    }

    // If moving to a new folder, verify ownership of the target folder
    if (folder_id) {
      const { data: folderDoc } = await admin
        .from('save_folders')
        .select('id')
        .eq('id', folder_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!folderDoc) {
        return NextResponse.json({ error: 'Target folder not found or forbidden' }, { status: 403 });
      }
    }

    // Remove from any existing folder
    await admin
      .from('save_folder_items')
      .delete()
      .eq('save_id', save_id);

    // If folder_id is provided, add to new folder
    if (folder_id) {
      await (admin.from('save_folder_items') as any)
        .insert({
          folder_id,
          save_id,
        });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PUT /api/saves:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
