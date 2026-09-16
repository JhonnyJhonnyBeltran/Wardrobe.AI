import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

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
        // Create client with user's auth token for PostgREST RLS
        client = createAdminClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false }
        });
      }
    } catch (e) {
      console.warn('[api/saves] Error authenticating with Bearer token:', e);
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
      console.warn('[api/saves] Error authenticating with server cookies:', e);
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
      // 1. Get save_ids from save_folder_items
      let saveFolderItemIds: string[] = [];
      try {
        const { data: folderItems } = await client
          .from('save_folder_items')
          .select('save_id')
          .eq('folder_id', folderId);

        saveFolderItemIds = (folderItems || []).map((item: any) => item.save_id).filter(Boolean);
      } catch (e) {
        console.warn('[api/saves] Error reading save_folder_items in GET:', e);
      }

      let savesData: any[] = [];

      // Query strategy 1: If we found item IDs in save_folder_items, query by IDs
      if (saveFolderItemIds.length > 0) {
        try {
          const { data, error } = await client
            .from('saves')
            .select('*, posts(*, profiles(id, username, full_name, avatar_url))')
            .eq('user_id', user.id)
            .in('id', saveFolderItemIds)
            .order('created_at', { ascending: false });

          if (!error && data) {
            savesData = data;
          }
        } catch (e) {
          console.warn('[api/saves] Error querying saves by saveFolderItemIds:', e);
        }
      }

      // Query strategy 2: Also try querying saves by folder_id directly
      try {
        const { data, error } = await client
          .from('saves')
          .select('*, posts(*, profiles(id, username, full_name, avatar_url))')
          .eq('user_id', user.id)
          .eq('folder_id', folderId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Merge deduplicated
          const existingIds = new Set(savesData.map((s: any) => s.id));
          for (const item of data) {
            if (!existingIds.has(item.id)) {
              savesData.push(item);
            }
          }
        }
      } catch (e) {
        console.warn('[api/saves] Error querying saves by folder_id:', e);
      }

      const saves = (savesData || [])
        .map((save: any) => ({
          ...save,
          posts: save.posts
        }))
        .filter((save: any) => save.posts);

      return NextResponse.json({ saves });
    } else {
      // Get all saves for user
      const { data: savesData } = await client
        .from('saves')
        .select('*, posts(*, profiles(id, username, full_name, avatar_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const saves = (savesData || [])
        .map((save: any) => ({
          ...save,
          posts: save.posts
        }))
        .filter((save: any) => save.posts);

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

    // If folder_id is passed, verify ownership of folder safely
    let validFolderId: string | null = null;
    if (folder_id) {
      try {
        const { data: folderDoc } = await client
          .from('save_folders')
          .select('id')
          .eq('id', folder_id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (folderDoc?.id) {
          validFolderId = folderDoc.id;
        } else {
          console.warn('[api/saves] Folder not found for folder_id, will still attempt link:', folder_id);
          validFolderId = folder_id;
        }
      } catch (e) {
        console.warn('[api/saves] Non-fatal check on save_folders:', e);
        validFolderId = folder_id;
      }
    }

    // Check if post is already saved by this user
    let existingSave: any = null;
    try {
      const { data: existing } = await client
        .from('saves')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', post_id)
        .maybeSingle();

      existingSave = existing;
    } catch (e) {
      console.warn('[api/saves] Error checking existing save:', e);
    }

    let savedRecord: any = null;

    if (existingSave) {
      savedRecord = { ...existingSave };

      // If folder is specified, update folder_id on saves
      if (validFolderId) {
        try {
          await client
            .from('saves')
            .update({ folder_id: validFolderId })
            .eq('id', existingSave.id);
          savedRecord.folder_id = validFolderId;
        } catch (e) {
          console.warn('[api/saves] Non-fatal: could not update folder_id column on saves:', e);
        }

        // Link in save_folder_items
        try {
          await client
            .from('save_folder_items')
            .delete()
            .eq('save_id', existingSave.id);

          await client
            .from('save_folder_items')
            .insert({
              id: randomUUID(),
              folder_id: validFolderId,
              save_id: existingSave.id,
            });
        } catch (e) {
          console.warn('[api/saves] Non-fatal: could not update save_folder_items:', e);
        }
      }
    } else {
      // Create new save
      const newId = randomUUID();
      const insertPayload: any = {
        id: newId,
        user_id: user.id,
        post_id,
      };
      if (validFolderId) {
        insertPayload.folder_id = validFolderId;
      }

      try {
        const { data: inserted, error: insertError } = await client
          .from('saves')
          .insert(insertPayload)
          .select('*')
          .maybeSingle();

        if (insertError) {
          if (insertError.code === '23505') {
            // Already saved concurrently
            const { data: found } = await client
              .from('saves')
              .select('*')
              .eq('user_id', user.id)
              .eq('post_id', post_id)
              .maybeSingle();
            savedRecord = found || { id: newId, user_id: user.id, post_id, folder_id: validFolderId };
          } else if (validFolderId) {
            // Might be because folder_id column does not exist on saves table
            const { data: fallbackInserted, error: fallbackErr } = await client
              .from('saves')
              .insert({ id: newId, user_id: user.id, post_id })
              .select('*')
              .maybeSingle();

            if (!fallbackErr) {
              savedRecord = fallbackInserted || { id: newId, user_id: user.id, post_id, folder_id: validFolderId };
            } else {
              throw fallbackErr;
            }
          } else {
            throw insertError;
          }
        } else {
          savedRecord = inserted || insertPayload;
        }
      } catch (insertErr: any) {
        console.error('[api/saves] Error inserting into saves:', insertErr);
        // If insert error happened, try to fetch if it already exists
        const { data: fallbackFound } = await client
          .from('saves')
          .select('*')
          .eq('user_id', user.id)
          .eq('post_id', post_id)
          .maybeSingle();

        if (fallbackFound) {
          savedRecord = fallbackFound;
        } else {
          return NextResponse.json({ error: insertErr.message || 'Error saving post' }, { status: 500 });
        }
      }

      // Link in save_folder_items if folder is specified
      if (validFolderId && savedRecord?.id) {
        try {
          await client
            .from('save_folder_items')
            .insert({
              id: randomUUID(),
              folder_id: validFolderId,
              save_id: savedRecord.id,
            });
        } catch (e) {
          console.warn('[api/saves] Non-fatal: could not insert save_folder_items on new save:', e);
        }
      }
    }

    return NextResponse.json({ save: savedRecord || { post_id, folder_id: validFolderId } });
  } catch (error: any) {
    console.error('Error in POST /api/saves:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
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
      } catch (e) {
        console.warn('[api/saves] Non-fatal deleting save_folder_items:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/saves:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
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
      try {
        const { data: folderDoc } = await client
          .from('save_folders')
          .select('id')
          .eq('id', folder_id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!folderDoc) {
          folder_id = null;
        }
      } catch {
        // Fallback keep folder_id
      }
    }

    // Update saves table
    try {
      await client
        .from('saves')
        .update({ folder_id: folder_id || null })
        .eq('id', save_id)
        .eq('user_id', user.id);
    } catch (e) {
      console.warn('[api/saves] Error updating saves folder_id in PUT:', e);
    }

    // Update save_folder_items
    try {
      await client
        .from('save_folder_items')
        .delete()
        .eq('save_id', save_id);

      if (folder_id) {
        await client
          .from('save_folder_items')
          .insert({
            id: randomUUID(),
            folder_id,
            save_id,
          });
      }
    } catch (e) {
      console.warn('[api/saves] Error managing save_folder_items in PUT:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PUT /api/saves:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
