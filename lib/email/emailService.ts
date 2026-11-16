import nodemailer from 'nodemailer';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://klozet.es';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'soporte@klozet.es';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'klozet.enterprise@gmail.com';

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

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

/**
 * Base email layout wrapper with Klozet design standards
 */
function wrapEmailTemplate(content: string, previewText: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Klozet</title>
  ${previewText ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f7f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111113;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 580px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 28px;
      overflow: hidden;
      border: 1px solid #ebebf0;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    }
    .email-header {
      padding: 36px 36px 20px 36px;
      text-align: center;
      border-bottom: 1px solid #f1f1f4;
    }
    .brand-logo {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.8px;
      color: #111113;
      margin: 0;
      display: inline-block;
    }
    .brand-accent {
      color: #FF66C4;
    }
    .brand-tagline {
      font-size: 13px;
      color: #71717a;
      margin: 6px 0 0 0;
      font-weight: 500;
    }
    .email-body {
      padding: 36px;
      font-size: 15px;
      line-height: 1.65;
      color: #27272a;
    }
    .cta-button {
      display: inline-block;
      background-color: #FF66C4;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 14px 32px;
      border-radius: 9999px;
      box-shadow: 0 4px 14px rgba(255, 102, 196, 0.35);
      margin: 20px 0;
      text-align: center;
    }
    .email-footer {
      padding: 24px 36px 32px 36px;
      background-color: #fafafc;
      border-top: 1px solid #f1f1f4;
      text-align: center;
      font-size: 12px;
      color: #a1a1aa;
      line-height: 1.5;
    }
    .email-footer a {
      color: #71717a;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="brand-logo">Klozet<span class="brand-accent">.</span></h1>
      <p class="brand-tagline">Armario Digital · Estilista IA · Comunidad de Moda</p>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <p style="margin: 0 0 8px 0;">Klozet — Tu armario inteligente y asesoría de imagen 24/7.</p>
      <p style="margin: 0 0 8px 0;">
        <a href="${SITE_URL}/closet">Mi Armario</a> · 
        <a href="${SITE_URL}/feed">Inspiración</a> · 
        <a href="${SITE_URL}/profile/settings">Ajustes</a>
      </p>
      <p style="margin: 0;">¿Dudas o sugerencias? Escríbenos a <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. Email de Bienvenida al registrarse
 */
export async function sendWelcomeEmail({
  to,
  name,
  username
}: {
  to: string;
  name?: string;
  username?: string;
}): Promise<boolean> {
  if (!to || !to.includes('@')) return false;
  const transporter = createTransporter();
  const displayName = name || (username ? `@${username.replace(/^@/, '')}` : 'amante de la moda');

  const content = `
    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #111113;">
      ¡Te damos la bienvenida a Klozet, ${displayName}! 🎀
    </h2>
    <p>
      Nos alegra un montón que te unas a la comunidad. Desde hoy tienes en el bolsillo una forma completamente nueva de relacionarte con tu ropa: digitalizar tu armario, descubrir combinaciones que no imaginabas y compartir tu estilo diario.
    </p>

    <div style="background-color: #fbfbfd; border: 1px solid #f0f0f4; border-radius: 20px; padding: 22px; margin: 24px 0;">
      <h3 style="font-size: 14px; font-weight: 700; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px; color: #FF66C4;">
        3 pasos para empezar hoy:
      </h3>
      <div style="margin-bottom: 14px;">
        <strong>1. Haz una foto a tus prendas</strong><br>
        <span style="font-size: 13px; color: #52525b;">Sube tus camisetas, pantalones, zapatillas o chaquetas. La IA de Klozet elimina el fondo automáticamente en segundos.</span>
      </div>
      <div style="margin-bottom: 14px;">
        <strong>2. Pregúntale a Kloe qué ponerte</strong><br>
        <span style="font-size: 13px; color: #52525b;">Tu estilista IA analiza las prendas reales que tienes, el clima de tu ciudad y el plan del día para armarte el outfit perfecto.</span>
      </div>
      <div>
        <strong>3. Inspírate y guarda looks</strong><br>
        <span style="font-size: 13px; color: #52525b;">Descubre outfits en el feed, guarda tus favoritos en carpetas temáticas y conecta con otras personas con tu mismo rollo.</span>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0 10px 0;">
      <a href="${SITE_URL}/closet" class="cta-button">
        Entrar a mi Armario Virtual →
      </a>
    </div>

    <p style="font-size: 13px; color: #71717a; text-align: center; margin-top: 15px;">
      O si lo prefieres, abre directamente la app desde tu móvil.
    </p>
  `;

  const html = wrapEmailTemplate(content, '¡Bienvenido a Klozet! Digitaliza tu ropa y descubre tu estilista IA.');

  if (!transporter) {
    console.log(`[EmailService] Welcome email queued for ${to} (transporter not configured)`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"Klozet" <${SUPPORT_EMAIL}>`,
      to,
      replyTo: SUPPORT_EMAIL,
      subject: '¡Te damos la bienvenida a Klozet! 🎀',
      text: `¡Hola ${displayName}!\n\nBienvenido a Klozet. Tu armario inteligente y estilista Kloe están listos.\n\nEmpieza subiendo tus prendas en: ${SITE_URL}/closet\n\nEl equipo de Klozet`,
      html,
    });
    console.log(`[EmailService] Welcome email sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[EmailService] Error sending welcome email to ${to}:`, err);
    return false;
  }
}

/**
 * 2. Email de Agradecimiento y Bienvenida a Klozet Pro (Compra completada)
 */
export async function sendProWelcomeEmail({
  to,
  name,
  plan = 'yearly',
  nextBillingDate,
  amount
}: {
  to: string;
  name?: string;
  plan?: 'monthly' | 'yearly';
  nextBillingDate?: string;
  amount?: string;
}): Promise<boolean> {
  if (!to || !to.includes('@')) return false;
  const transporter = createTransporter();
  const displayName = name || 'amigo/a';
  const planLabel = plan === 'yearly' ? 'Plan Anual Klozet Pro (Oferta Especial)' : 'Plan Mensual Klozet Pro';
  const priceDisplay = amount || (plan === 'yearly' ? '24,99 €/año' : '2,99 €/mes');

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: rgba(255, 102, 196, 0.12); color: #FF66C4; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.8px;">
        Suscripción Confirmada
      </span>
    </div>

    <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #111113; text-align: center; letter-spacing: -0.5px;">
      ¡Muchas gracias por suscribirte a Klozet Pro, ${displayName}! ✨
    </h2>

    <p style="text-align: center; color: #52525b; margin: 0 0 28px 0;">
      Tu apoyo hace posible que sigamos perfeccionando la app y llevando la mejor tecnología de moda a tu bolsillo.
    </p>

    <!-- Resumen de suscripción -->
    <div style="background-color: #fbfbfd; border: 1px solid #f0f0f4; border-radius: 20px; padding: 22px; margin-bottom: 26px;">
      <h3 style="font-size: 13px; font-weight: 700; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px; color: #111113;">
        Detalles de tu suscripción:
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #71717a;">Plan contratado:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #111113;">${planLabel}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717a;">Tarifa:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #111113;">${priceDisplay}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717a;">Estado:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #10b981;">● Activo</td>
        </tr>
        ${nextBillingDate ? `
        <tr>
          <td style="padding: 6px 0; color: #71717a;">Próximo cobro:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #111113;">${nextBillingDate}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- Funcionalidades desbloqueadas -->
    <div style="background-color: #ffffff; border: 1px solid #f0f0f4; border-radius: 20px; padding: 22px; margin-bottom: 26px;">
      <h3 style="font-size: 13px; font-weight: 700; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px; color: #FF66C4;">
        Todo lo que tienes activo desde ahora:
      </h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #3f3f46; line-height: 1.8;">
        <li><strong>💬 Consultas ilimitadas con Kloe</strong>: Asesoría de moda 24/7 sin límite de mensajes diarios.</li>
        <li><strong>📸 Análisis multimodal de prendas</strong>: Sube fotos de tu ropa para que Kloe observe colores reales, tejidos y cortes.</li>
        <li><strong>📅 Programación en Calendario</strong>: Asigna y planifica tus outfits para cada día de la semana.</li>
        <li><strong>📱 Widgets de iPhone</strong>: Lleva el look programado para hoy directamente en la pantalla de inicio de tu iPhone.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${SITE_URL}/closet/kloe" class="cta-button">
        Probar Kloe Pro ahora →
      </a>
    </div>

    <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin-top: 18px; line-height: 1.5;">
      Puedes gestionar o cancelar tu suscripción en cualquier momento desde <a href="${SITE_URL}/profile/settings" style="color: #FF66C4; text-decoration: underline;">Configuración &gt; Suscripción</a>.
    </p>
  `;

  const html = wrapEmailTemplate(content, '¡Gracias por unirte a Klozet Pro! Tu acceso ya está activo.');

  if (!transporter) {
    console.log(`[EmailService] Pro Welcome email queued for ${to} (transporter not configured)`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"Klozet Pro" <${SUPPORT_EMAIL}>`,
      to,
      replyTo: SUPPORT_EMAIL,
      subject: '¡Bienvenido a Klozet Pro! Tu acceso ya está activo ✨',
      text: `¡Muchas gracias por suscribirte a Klozet Pro, ${displayName}!\n\nTu suscripción (${planLabel}) ya está activa con consultas ilimitadas con Kloe, fotos de prendas y calendario de outfits.\n\nPruébalo aquí: ${SITE_URL}/closet/kloe\n\nEl equipo de Klozet`,
      html,
    });
    console.log(`[EmailService] Pro Welcome email sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[EmailService] Error sending Pro Welcome email to ${to}:`, err);
    return false;
  }
}

/**
 * 3. Email de Confirmación de Cancelación de Suscripción
 */
export async function sendCancellationEmail({
  to,
  name,
  accessUntilDate
}: {
  to: string;
  name?: string;
  accessUntilDate?: string;
}): Promise<boolean> {
  if (!to || !to.includes('@')) return false;
  const transporter = createTransporter();
  const displayName = name || 'hola';

  const content = `
    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #111113;">
      Confirmación de cancelación de suscripción
    </h2>
    <p>
      Hola ${displayName},
    </p>
    <p>
      Te confirmamos que hemos procesado la cancelación de tu suscripción a <strong>Klozet Pro</strong>.
    </p>

    <div style="background-color: #fbfbfd; border: 1px solid #f0f0f4; border-radius: 20px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #3f3f46;">
        💡 <strong>Importante:</strong> Seguirás teniendo acceso completo a todas las ventajas de Klozet Pro hasta el <strong>${accessUntilDate || 'final de tu periodo pagado'}</strong>. A partir de esa fecha, tu cuenta pasará automáticamente al plan gratuito sin ningún cargo adicional.
      </p>
    </div>

    <p style="font-size: 14px; color: #52525b;">
      Nos encantaría saber qué podemos mejorar. Si tienes un minuto, puedes responder directamente a este correo contándonos qué te ha faltado o qué podríamos hacer mejor.
    </p>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${SITE_URL}/feed" class="cta-button" style="background-color: #111113;">
        Ir a Klozet
      </a>
    </div>
  `;

  const html = wrapEmailTemplate(content, 'Confirmación de cancelación de tu suscripción a Klozet Pro.');

  if (!transporter) {
    console.log(`[EmailService] Cancellation email queued for ${to} (transporter not configured)`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"Klozet" <${SUPPORT_EMAIL}>`,
      to,
      replyTo: SUPPORT_EMAIL,
      subject: 'Confirmación de cancelación de Klozet Pro',
      text: `Hola ${displayName},\n\nHemos procesado la cancelación de tu suscripción a Klozet Pro. Mantendrás tu acceso activo hasta ${accessUntilDate || 'el fin de tu periodo pagado'} sin cobros adicionales.\n\nEl equipo de Klozet`,
      html,
    });
    console.log(`[EmailService] Cancellation email sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[EmailService] Error sending cancellation email to ${to}:`, err);
    return false;
  }
}

/**
 * 4. Email de Aviso de Pago Fallido en Renovación
 */
export async function sendPaymentFailedEmail({
  to,
  name,
  retryUrl
}: {
  to: string;
  name?: string;
  retryUrl?: string;
}): Promise<boolean> {
  if (!to || !to.includes('@')) return false;
  const transporter = createTransporter();
  const displayName = name || 'hola';
  const url = retryUrl || `${SITE_URL}/profile/settings`;

  const content = `
    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #ef4444;">
      Problema al renovar tu suscripción a Klozet Pro
    </h2>
    <p>
      Hola ${displayName},
    </p>
    <p>
      No hemos podido procesar el cobro de la renovación de tu suscripción a <strong>Klozet Pro</strong> con tu método de pago habitual.
    </p>
    <p>
      Para evitar que pierdas acceso a tus consultas ilimitadas con Kloe y tus looks en el calendario, dispones de un <strong>periodo de gracia de 3 días</strong> para actualizar tu tarjeta.
    </p>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${url}" class="cta-button">
        Actualizar método de pago →
      </a>
    </div>

    <p style="font-size: 13px; color: #71717a; text-align: center; margin-top: 15px;">
      Si necesitas ayuda, puedes responder directamente a este correo.
    </p>
  `;

  const html = wrapEmailTemplate(content, 'Aviso sobre el pago de renovación de Klozet Pro.');

  if (!transporter) {
    console.log(`[EmailService] Payment failed email queued for ${to} (transporter not configured)`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"Klozet" <${SUPPORT_EMAIL}>`,
      to,
      replyTo: SUPPORT_EMAIL,
      subject: 'Aviso sobre el pago de tu suscripción a Klozet Pro',
      text: `Hola ${displayName},\n\nNo hemos podido renovar tu suscripción a Klozet Pro. Por favor, actualiza tu método de pago en: ${url}\n\nEl equipo de Klozet`,
      html,
    });
    console.log(`[EmailService] Payment failed email sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[EmailService] Error sending payment failed email to ${to}:`, err);
    return false;
  }
}
