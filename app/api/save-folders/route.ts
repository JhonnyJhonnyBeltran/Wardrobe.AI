'use server';

/**
 * API Route for Save Folders management
 * Handles CRUD operations for save folders
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ folders: [] }, { status: 401 });
    }

    const { data: folders, error } = await supabase
      .from('save_folders')
      .select('*, save_folder_items(saves(posts(image_url)))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ folders: [] }, { status: 500 });
    }

    const enhancedFolders = (folders || []).map(folder => {
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
    return NextResponse.json({ folders: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, color } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('save_folders')
      .insert({
        user_id: user.id,
        name: name.trim(),
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, icon, color } = body;

    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('save_folders')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    updateData.updated_at = new Date().toISOString();

    const { data } = await supabase
      .from('save_folders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return NextResponse.json({ folder: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('save_folders')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await supabase.from('save_folder_items').delete().eq('folder_id', id);
    await supabase.from('save_folders').delete().eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
