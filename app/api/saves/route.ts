'use server';

/**
 * API Route for Saves management
 * Handles saving posts and organizing them into folders
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

/**
 * GET /api/saves
 * Get all saved posts for the user, optionally filtered by folder
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ saves: [] }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folder_id');

    if (folderId) {
      // Get saves in a specific folder
      const { data: folderItems } = await supabase
        .from('save_folder_items')
        .select('save_id')
        .eq('folder_id', folderId);

      const saveIds = (folderItems || []).map(item => item.save_id);

      if (saveIds.length === 0) {
        return NextResponse.json({ saves: [] });
      }

      const { data: savesData } = await supabase
        .from('saves')
        .select('*, posts(*)')
        .in('id', saveIds)
        .order('created_at', { ascending: false });

      const saves = (savesData || []).map((save: any) => ({
        ...save,
        posts: save.posts
      })).filter((save: any) => save.posts);

      return NextResponse.json({ saves });
    } else {
      // Get all saves
      const { data: savesData } = await supabase
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { post_id, folder_id } = body;

    if (!post_id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if already saved
    const { data: existing, error: fetchError } = await supabase
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
        await supabase.from('save_folder_items').delete().eq('save_id', existing.id);

        const { error: insertError } = await (supabase.from('save_folder_items') as any).insert({ folder_id, save_id: existing.id });
        if (insertError) {
          if (insertError.code === '23505') {
            // Already assigned to this folder
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
    const { data: save, error } = await (supabase.from('saves') as any)
      .insert({
        id: newId,
        user_id: user.id,
        post_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Already saved
        return NextResponse.json({ save: { post_id } });
      }
      console.error('Error saving post:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    // If folder_id is provided, add to folder
    if (folder_id) {
      await (supabase.from('save_folder_items') as any)
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const saveId = searchParams.get('id');
    const postId = searchParams.get('post_id');

    if (!saveId && !postId) {
      return NextResponse.json({ error: 'Save ID or Post ID is required' }, { status: 400 });
    }

    let query = supabase.from('saves').delete().eq('user_id', user.id);

    if (saveId) {
      query = query.eq('id', saveId);
    } else if (postId) {
      query = query.eq('post_id', postId);
    }

    await query;

    // Also remove from any folders
    if (saveId) {
      await supabase
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { save_id, folder_id } = body;

    if (!save_id) {
      return NextResponse.json({ error: 'Save ID is required' }, { status: 400 });
    }

    // Remove from any existing folder
    await supabase
      .from('save_folder_items')
      .delete()
      .eq('save_id', save_id);

    // If folder_id is provided, add to new folder
    if (folder_id) {
      await (supabase.from('save_folder_items') as any)
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
