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

// Helper to authenticate user and select appropriate database client
async function getDbClient(request: NextRequest) {
  let user: any = null;
  let supabaseServerClient: any = null;

  try {
    supabaseServerClient = await createClient();
    const { data } = await supabaseServerClient.auth.getUser();
    user = data?.user || null;
  } catch {}

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!user && authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '').trim();
      const admin = getAdmin();
      const { data } = await admin.auth.getUser(token);
      if (data?.user) {
        user = data.user;
      }
    } catch {}
  }

  const hasServiceRole = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
  const client = (hasServiceRole ? getAdmin() : (supabaseServerClient || getAdmin()));

  return { client, user };
}

/**
 * GET /api/saves
 * Get all saved posts for the user, optionally filtered by folder
 */
export async function GET(request: NextRequest) {
  try {
    const { client, user } = await getDbClient(request);

    if (!user) {
      return NextResponse.json({ saves: [] }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folder_id');

    if (folderId) {
      // Validate that folder belongs to user
      const { data: folder } = await client
        .from('save_folders')
        .select('id')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!folder) {
        return NextResponse.json({ saves: [] });
      }

      // Check both save_folder_items AND saves.folder_id
      let saveFolderItemIds: string[] = [];
      try {
        const { data: folderItems } = await client
          .from('save_folder_items')
          .select('save_id')
          .eq('folder_id', folderId);

        saveFolderItemIds = (folderItems || []).map((item: any) => item.save_id).filter(Boolean);
      } catch {}

      let query = client
        .from('saves')
        .select('*, posts(*)')
        .eq('user_id', user.id);

      if (saveFolderItemIds.length > 0) {
        query = query.or(`id.in.(${saveFolderItemIds.join(',')}),folder_id.eq.${folderId}`);
      } else {
        query = query.eq('folder_id', folderId);
      }

      const { data: savesData, error: savesError } = await query.order('created_at', { ascending: false });

      if (savesError) {
        // Fallback: query by folder_id directly
        const { data: fallbackData } = await client
          .from('saves')
          .select('*, posts(*)')
          .eq('user_id', user.id)
          .eq('folder_id', folderId)
          .order('created_at', { ascending: false });

        const saves = (fallbackData || []).map((save: any) => ({
          ...save,
          posts: save.posts
        })).filter((save: any) => save.posts);

        return NextResponse.json({ saves });
      }

      const saves = (savesData || []).map((save: any) => ({
        ...save,
        posts: save.posts
      })).filter((save: any) => save.posts);

      return NextResponse.json({ saves });
    } else {
      // Get all saves for this user
      const { data: savesData } = await client
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
    const { client, user } = await getDbClient(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // If folder_id is passed, verify ownership of folder
    if (folder_id) {
      const { data: folderDoc } = await client
        .from('save_folders')
        .select('id')
        .eq('id', folder_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!folderDoc) {
        // If folder doesn't exist or isn't owned by user, don't fail saving the post entirely, reset folder_id
        console.warn('Folder not found or unauthorized for folder_id:', folder_id);
        folder_id = null;
      }
    }

    // Check if already saved
    const { data: existing, error: fetchError } = await client
      .from('saves')
      .select('id, folder_id')
      .eq('user_id', user.id)
      .eq('post_id', post_id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.warn('Error checking existing save:', fetchError);
    }

    if (existing) {
      if (folder_id) {
        // Update folder_id in saves
        try {
          await (client.from('saves') as any).update({ folder_id }).eq('id', existing.id);
        } catch (e) {
          console.warn('Error updating folder_id on saves:', e);
        }

        // Also update save_folder_items table safely
        try {
          await client.from('save_folder_items').delete().eq('save_id', existing.id);
          const { error: insertErr } = await (client.from('save_folder_items') as any).insert({
            id: randomUUID(),
            folder_id,
            save_id: existing.id
          });
          if (insertErr && insertErr.code !== '23505') {
            console.warn('Non-fatal warning inserting save_folder_items:', insertErr);
          }
        } catch (e) {
          console.warn('Error managing save_folder_items:', e);
        }
      }
      return NextResponse.json({ save: { ...existing, folder_id: folder_id || existing.folder_id } });
    }

    // Create new save
    const newId = randomUUID();
    const insertPayload: any = {
      id: newId,
      user_id: user.id,
      post_id,
    };
    if (folder_id) {
      insertPayload.folder_id = folder_id;
    }

    const { data: save, error } = await (client.from('saves') as any)
      .insert(insertPayload)
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint conflict (already saved)
        if (folder_id) {
          await (client.from('saves') as any).update({ folder_id }).eq('user_id', user.id).eq('post_id', post_id);
        }
        const { data: existingSave } = await client
          .from('saves')
          .select('*')
          .eq('user_id', user.id)
          .eq('post_id', post_id)
          .maybeSingle();

        return NextResponse.json({ save: existingSave || { post_id, folder_id } });
      }
      console.error('Error saving post:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    const createdSave = save || { id: newId, user_id: user.id, post_id, folder_id };

    // Sync save_folder_items table safely
    if (folder_id && createdSave.id) {
      try {
        await (client.from('save_folder_items') as any)
          .insert({
            id: randomUUID(),
            folder_id,
            save_id: createdSave.id,
          });
      } catch (e) {
        console.warn('Non-fatal warning inserting save_folder_items on new save:', e);
      }
    }

    return NextResponse.json({ save: createdSave });
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
    const { client, user } = await getDbClient(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (postId && !saveId) {
      const { data: foundSave } = await client
        .from('saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();
      if (foundSave) {
        saveId = foundSave.id;
      }
    }

    let query = client.from('saves').delete().eq('user_id', user.id);

    if (saveId) {
      query = query.eq('id', saveId);
    } else if (postId) {
      query = query.eq('post_id', postId);
    }

    await query;

    // Remove from save_folder_items
    if (saveId) {
      try {
        await client
          .from('save_folder_items')
          .delete()
          .eq('save_id', saveId);
      } catch {}
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
    const { client, user } = await getDbClient(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { save_id, folder_id } = body;

    if (!save_id) {
      return NextResponse.json({ error: 'Save ID is required' }, { status: 400 });
    }

    // Verify ownership of save
    const { data: saveDoc } = await client
      .from('saves')
      .select('id, user_id')
      .eq('id', save_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!saveDoc) {
      return NextResponse.json({ error: 'Save item not found or forbidden' }, { status: 403 });
    }

    // If moving to a target folder, verify ownership
    if (folder_id) {
      const { data: folderDoc } = await client
        .from('save_folders')
        .select('id')
        .eq('id', folder_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!folderDoc) {
        folder_id = null;
      }
    }

    // Update saves table
    try {
      await (client.from('saves') as any)
        .update({ folder_id: folder_id || null })
        .eq('id', save_id)
        .eq('user_id', user.id);
    } catch (e) {
      console.warn('Error updating saves folder_id in PUT:', e);
    }

    // Update save_folder_items
    try {
      await client
        .from('save_folder_items')
        .delete()
        .eq('save_id', save_id);

      if (folder_id) {
        await (client.from('save_folder_items') as any)
          .insert({
            id: randomUUID(),
            folder_id,
            save_id,
          });
      }
    } catch (e) {
      console.warn('Error managing save_folder_items in PUT:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PUT /api/saves:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
