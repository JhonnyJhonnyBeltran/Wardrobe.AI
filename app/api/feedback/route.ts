import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const LOCAL_FEEDBACK_FILE = path.join(process.cwd(), 'data', 'local_feedback.json');
const KLOZET_SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'soporte@klozet.es';
const KLOZET_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'klozet.enterprise@gmail.com';

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

/**
 * Creates email transporter based on available environment variables:
 * - SMTP (host, port, user, pass)
 * - Gmail App Password (GMAIL_USER, GMAIL_APP_PASSWORD)
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'klozet.enterprise@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!pass) return null;

  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Default to Gmail service if user/pass present
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
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

    // 1. Save to local JSON archive
    saveToLocalFallback(feedbackRecord);

    // 2. Save to Supabase database if available
    try {
      const supabase = await createClient();
      await supabase.from('user_feedback').insert([feedbackRecord]);
    } catch (dbErr) {
      console.warn('[FeedbackAPI] DB insert notice (fallback to local active):', dbErr);
    }

    // 3. Automated Email Dispatch
    const transporter = createTransporter();
    let emailSent = false;

    const confirmationText = `Hola,\n\nHemos recibido tu reporte. Nuestro equipo ya está trabajando duro para solucionarlo.\n\nMuchas gracias por seguir ayudando a la aplicación a crecer.\n\nAtentamente,\nEl equipo de Klozet\n${KLOZET_SUPPORT_EMAIL}`;

    const confirmationHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111113; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #FF66C4; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Klozet</h2>
          <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Soporte y Asistencia</p>
        </div>
        <div style="background-color: #f9f9fa; border: 1px solid #eaeaea; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <p style="font-size: 15px; margin-top: 0;">Hola,</p>
          <p style="font-size: 15px; font-weight: 600; color: #111113;">
            Hemos recibido tu reporte. Nuestro equipo ya está trabajando duro para solucionarlo.
          </p>
          <p style="font-size: 14px; color: #555;">
            Muchas gracias por seguir ayudando a la aplicación a crecer. Si necesitamos algún dato adicional sobre lo sucedido, te responderemos directamente a este correo.
          </p>
          <div style="margin-top: 20px; padding: 12px 16px; background: #ffffff; border-radius: 10px; border-left: 3px solid #FF66C4; font-size: 13px; color: #666;">
            <strong>Categoría:</strong> ${category || 'Error'}<br/>
            <strong>Mensaje:</strong> "${message.trim()}"
          </div>
        </div>
        <p style="font-size: 13px; color: #888; text-align: center; margin: 0;">
          El equipo de Klozet · <a href="https://klozet.es" style="color: #FF66C4; text-decoration: none;">klozet.es</a>
        </p>
      </div>
    `;

    if (transporter) {
      try {
        // Send auto-reply to user
        if (email && email.includes('@')) {
          await transporter.sendMail({
            from: `"Klozet Soporte" <${KLOZET_SUPPORT_EMAIL}>`,
            to: email,
            replyTo: KLOZET_SUPPORT_EMAIL,
            subject: 'Hemos recibido tu reporte - Klozet',
            text: confirmationText,
            html: confirmationHtml,
          });
          emailSent = true;
        }

        // Forward to Klozet admin team
        await transporter.sendMail({
          from: `"Klozet Feedback Bot" <${KLOZET_SUPPORT_EMAIL}>`,
          to: KLOZET_ADMIN_EMAIL,
          subject: `[Reporte Klozet] ${category}: ${username || email || 'Usuario anónimo'}`,
          text: `Nuevo reporte recibido:\n\nUsuario: ${username || 'N/A'}\nEmail: ${email || 'N/A'}\nCategoría: ${category}\nMensaje: ${message.trim()}\nMetadata: ${JSON.stringify(metadata, null, 2)}`
        });
      } catch (mailErr) {
        console.warn('[FeedbackAPI] Mail send notice:', mailErr);
      }
    } else {
      console.log('[FeedbackAPI] SMTP not configured. Feedback recorded in database and local archive.');
    }

    return NextResponse.json({
      success: true,
      item: feedbackRecord,
      emailSent,
      confirmationMessage: 'Hemos recibido tu reporte. Nuestro equipo está trabajando duro para solucionarlo. Muchas gracias por seguir ayudando a la aplicación a crecer.'
    });
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
          const existingIds = new Set(items.map(i => i.id));
          for (const li of localItems) {
            if (!existingIds.has(li.id)) {
              items.push(li);
            }
          }
        }
      } catch (fileErr) {
        console.warn('[FeedbackAPI] Could not read local file fallback');
      }
    }

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('[FeedbackAPI] Error fetching feedback:', err);
    return NextResponse.json({ error: 'Error obteniendo feedback' }, { status: 500 });
  }
}
