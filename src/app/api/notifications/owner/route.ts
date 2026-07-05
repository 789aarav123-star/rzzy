import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const OWNER_EMAIL = '789aarav123@gmail.com';
const OWNER_PHONE = '+9779807732560';
const DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order } = body;

    if (!order) {
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 });
    }

    const results: { email: boolean; whatsapp: boolean } = { email: false, whatsapp: false };

    // ─── Send Email to Owner ─────────────────
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
    if (RESEND_API_KEY || SMTP_PASSWORD) {
      const itemsList = order.items
        .map(
          (item: any) =>
            `${item.product.name} × ${item.quantity} (${item.size}/${item.color}) - $${(
              item.product.price * item.quantity
            ).toFixed(2)}`
        )
        .join('<br/>');

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 28px; font-weight: 800; color: #111;">🛒 New Order Received!</h1>
          </div>

          <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; margin: 0 0 5px;">Order ID</p>
            <p style="font-size: 14px; font-weight: 600; color: #111; margin: 0;">#${order.id}</p>
            <p style="font-size: 12px; color: #888; margin: 10px 0 0;">Customer</p>
            <p style="font-size: 14px; color: #111; margin: 0;">${order.customerName} (${order.customerEmail})</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; font-size: 12px; color: #666;">Item</th>
                <th style="padding: 10px; text-align: right; font-size: 12px; color: #666;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item: any) => `
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        <strong>${item.product.name}</strong><br/>
                        <span style="color: #666; font-size: 12px;">${item.size} / ${item.color} × ${item.quantity}</span>
                      </td>
                      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                        $${(item.product.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>

          <div style="border-top: 2px solid #eee; padding-top: 15px;">
            <p style="font-size: 18px; font-weight: 700; color: #111; text-align: right;">
              Total: $${order.total?.toFixed(2)}
            </p>
          </div>

          <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 13px; font-weight: 600; color: #111; margin: 0 0 5px;">Payment</p>
            <p style="font-size: 13px; color: #666; margin: 0; text-transform: capitalize;">${order.paymentMethod || 'Card'}</p>
            <p style="font-size: 13px; font-weight: 600; color: #111; margin: 15px 0 5px;">Status</p>
            <p style="font-size: 13px; color: #666; margin: 0;">${order.status}</p>
          </div>

          ${order.shippingAddress?.street ? `
            <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="font-size: 13px; font-weight: 600; color: #111; margin: 0 0 5px;">Shipping Address</p>
              <p style="font-size: 13px; color: #666; margin: 0;">
                ${order.shippingAddress.street}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br/>
                ${order.shippingAddress.country}
              </p>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <a href="${DASHBOARD_URL}/dashboard/orders"
               style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 500;">
              Open Dashboard
            </a>
          </div>
        </div>
      `;

      try {
        if (SMTP_PASSWORD) {
          const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
          const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
          const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_FROM || '789aarav123@gmail.com';

          const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: {
              user: SMTP_USER,
              pass: SMTP_PASSWORD.replace(/\s+/g, ''),
            },
          });

          await transporter.sendMail({
            from: `"rzzy" <${SMTP_USER}>`,
            to: OWNER_EMAIL,
            subject: `🛒 New Order! #${order.id.slice(0, 8)} - $${order.total?.toFixed(2)}`,
            html: emailHtml,
          });
          results.email = true;
        } else if (RESEND_API_KEY) {
          let emailFrom = process.env.EMAIL_FROM || 'rzzy <notifications@rzzy.studio>';
          if (
            emailFrom.includes('@gmail.com') ||
            emailFrom.includes('@yahoo.com') ||
            emailFrom.includes('@outlook.com') ||
            emailFrom.includes('@hotmail.com')
          ) {
            console.warn(
              `WARNING: EMAIL_FROM is set to "${emailFrom}". Resend does not support sending from personal domains. Falling back to "onboarding@resend.dev" for compatibility.`
            );
            emailFrom = 'rzzy <onboarding@resend.dev>';
          }

          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: emailFrom,
              to: OWNER_EMAIL,
              subject: `🛒 New Order! #${order.id.slice(0, 8)} - $${order.total?.toFixed(2)}`,
              html: emailHtml,
            }),
          });
          results.email = emailRes.ok;
          if (!emailRes.ok) {
            const errorText = await emailRes.text();
            console.error('Owner Resend API error:', errorText);
            console.error(
              'TIP: If you receive a "validation_error" or "restricted" error, check that:\n' +
              '1. Your EMAIL_FROM domain is verified in Resend (Gmail/Yahoo/etc. are NOT supported as from addresses).\n' +
              '2. In sandbox mode, you can ONLY send emails to your verified owner email address (not arbitrary customers).'
            );
          }
        }
      } catch (err) {
        console.error('Failed to send owner email:', err);
      }
    }

    // ─── Send WhatsApp via Twilio ────────────────────────
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
      const itemsList = order.items
        .map(
          (item: any) =>
            `• ${item.product.name} × ${item.quantity} - $${(item.product.price * item.quantity).toFixed(2)}`
        )
        .join('\n');

      const messageBody = `🛒 *NEW ORDER!* 🛒
━━━━━━━━━━━━━━━━━
*Order:* #${order.id.slice(0, 8)}
*Customer:* ${order.customerName}
*Email:* ${order.customerEmail}
*Total:* $${order.total?.toFixed(2)}
*Payment:* ${order.paymentMethod || 'Card'}
*Status:* ${order.status}
━━━━━━━━━━━━━━━━━
*Items:*
${itemsList}
━━━━━━━━━━━━━━━━━
🔗 Dashboard: ${DASHBOARD_URL}/dashboard/orders`;

      try {
        const authString = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
        const whatsappRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${authString}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
              To: `whatsapp:${OWNER_PHONE}`,
              Body: messageBody,
            }),
          }
        );
        results.whatsapp = whatsappRes.ok;
        if (!whatsappRes.ok) {
          const errText = await whatsappRes.text();
          console.error('Twilio WhatsApp error:', errText);
        }
      } catch (err) {
        console.error('Failed to send WhatsApp:', err);
      }
    }

    return NextResponse.json({
      message: 'Notifications processed',
      results,
    });
  } catch (err) {
    console.error('Owner notification error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
