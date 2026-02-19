import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/categories
 * Fetch all active categories from the database
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Categories API] Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ categories: data || [] });
  } catch (error) {
    console.error('[Categories API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new category (admin only - currently allows all)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, icon, color, is_active = true, display_order = 0 } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        icon,
        color,
        is_active,
        display_order,
      })
      .select()
      .single();

    if (error) {
      console.error('[Categories API] Error creating category:', error);
      return NextResponse.json(
        { error: 'Failed to create category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error) {
    console.error('[Categories API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories
 * Update an existing category
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, icon, color, is_active, display_order } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name) updates.name = name;
    if (slug) updates.slug = slug;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (is_active !== undefined) updates.is_active = is_active;
    if (display_order !== undefined) updates.display_order = display_order;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Categories API] Error updating category:', error);
      return NextResponse.json(
        { error: 'Failed to update category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ category: data });
  } catch (error) {
    console.error('[Categories API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories
 * Delete a category
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Categories API] Error deleting category:', error);
      return NextResponse.json(
        { error: 'Failed to delete category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Categories API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
