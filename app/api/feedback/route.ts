import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

const LOCAL_FEEDBACK_FILE = path.join(process.cwd(), 'data', 'local_feedback.json');

function saveToLocalFallback(feedbackItem: any) {
  try {
    const dir = path.dirname(LOCAL_FEEDBACK_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let items = [];
    if (fs.existsSync(LOCAL_FEEDBACK_FILE)) {
      const content = fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf-8');
      items = JSON.parse(content || '[]');
    }
    items.unshift(feedbackItem);
    fs.writeFileSync(LOCAL_FEEDBACK_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[FeedbackAPI] Could not save to local file fallback:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { category, message, email, userId, username, metadata } = body;

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json({ error: 'El mensaje es obligatorio' }, { status: 400 });
    }

    const feedbackRecord = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId || null,
      username: username || null,
      email: email || null,
      category: category || 'bug',
      message: message.trim(),
      metadata: metadata || {},
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // 1. Save to local JSON archive (always accessible for local dashboard even offline)
    saveToLocalFallback(feedbackRecord);

    // 2. Save to Supabase database if available
    try {
      const supabase = await createClient();
      await supabase.from('user_feedback').insert([feedbackRecord]);
    } catch (dbErr) {
      console.warn('[FeedbackAPI] DB insert notice (fallback to local active):', dbErr);
    }

    return NextResponse.json({ success: true, item: feedbackRecord });
  } catch (err: any) {
    console.error('[FeedbackAPI] Error:', err);
    return NextResponse.json({ error: 'Error procesando el reporte' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let items: any[] = [];

    // Try Supabase first
    try {
      const supabase = await createClient();
      let query = supabase.from('user_feedback').select('*').order('created_at', { ascending: false });
      if (category) query = query.eq('category', category);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        items = data;
      }
    } catch (dbErr) {
      console.warn('[FeedbackAPI] DB query notice, reading local fallback');
    }

    // Merge or fallback to local JSON file
    if (fs.existsSync(LOCAL_FEEDBACK_FILE)) {
      try {
        const localContent = fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf-8');
        const localItems = JSON.parse(localContent || '[]');
        if (items.length === 0) {
          items = localItems;
        } else {
          // Merge unique by ID
          const existingIds = new Set(items.map(i => i.id));
          for (const li of localItems) {
            if (!existingIds.has(li.id)) {
              items.push(li);
            }
          }
        }
      } catch (fErr) {
        console.warn('[FeedbackAPI] Local file read error:', fErr);
      }
    }

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    console.error('[FeedbackAPI] GET error:', err);
    return NextResponse.json({ error: 'Error al obtener feedbacks' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID y estado son requeridos' }, { status: 400 });
    }

    // Update in local file
    if (fs.existsSync(LOCAL_FEEDBACK_FILE)) {
      try {
        const content = fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf-8');
        const items = JSON.parse(content || '[]');
        const updated = items.map((it: any) => it.id === id ? { ...it, status } : it);
        fs.writeFileSync(LOCAL_FEEDBACK_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      } catch (err) {
        console.warn('[FeedbackAPI] Could not update local item:', err);
      }
    }

    // Update in Supabase
    try {
      const supabase = await createClient();
      await supabase.from('user_feedback').update({ status }).eq('id', id);
    } catch (dbErr) {
      console.warn('[FeedbackAPI] DB update notice:', dbErr);
    }

    return NextResponse.json({ success: true, id, status });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error actualizando estado' }, { status: 500 });
  }
}
