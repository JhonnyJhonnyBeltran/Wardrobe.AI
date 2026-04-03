import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/brands
 * Fetch all active brands from the database
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabase
      .from('brands')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Brands API] Error fetching brands:', error);
      return NextResponse.json(
        { error: 'Failed to fetch brands', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ brands: data || [] });
  } catch (error) {
    console.error('[Brands API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/brands
 * Create a new brand (admin only - currently allows all)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { name, slug, logo_url, website, is_active = true, display_order = 0 } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('brands')
      .insert({
        name,
        slug,
        logo_url,
        website,
        is_active,
        display_order,
      })
      .select()
      .single();

    if (error) {
      console.error('[Brands API] Error creating brand:', error);
      return NextResponse.json(
        { error: 'Failed to create brand', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ brand: data }, { status: 201 });
  } catch (error) {
    console.error('[Brands API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/brands
 * Update an existing brand
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, name, slug, logo_url, website, is_active, display_order } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name) updates.name = name;
    if (slug) updates.slug = slug;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (website !== undefined) updates.website = website;
    if (is_active !== undefined) updates.is_active = is_active;
    if (display_order !== undefined) updates.display_order = display_order;

    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Brands API] Error updating brand:', error);
      return NextResponse.json(
        { error: 'Failed to update brand', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ brand: data });
  } catch (error) {
    console.error('[Brands API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/brands
 * Delete a brand
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Brands API] Error deleting brand:', error);
      return NextResponse.json(
        { error: 'Failed to delete brand', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Brands API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
