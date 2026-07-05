import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';

function logDebug(message: string) {
  try {
    const logPath = '/Users/aaru/Documents/Project - 1/email-debug.log';
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
  } catch (e) {
    console.error('Failed to write debug log:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, order } = body;

    logDebug(`Received email request: type=${type}, customerEmail=${order?.customerEmail}`);

    if (!order || !order.customerEmail) {
      logDebug('Error: Missing order or customerEmail');
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 });
    }

    const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!SMTP_PASSWORD && !RESEND_API_KEY) {
      logDebug('Error: Neither SMTP_PASSWORD nor RESEND_API_KEY is configured');
      console.warn('Neither SMTP_PASSWORD nor RESEND_API_KEY configured - skipping email');
      return NextResponse.json({ message: 'Email service not configured' }, { status: 200 });
    }

    let subject: string;
    let html: string;

    const itemsHtml = order.items
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
      .join('');

    if (type === 'order-confirmation') {
      subject = `Order Confirmed! #${order.id.slice(0, 8)} - rzzy`;
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #111;">rzzy</h1>
            <p style="color: #059669; font-size: 16px; font-weight: 600;">✅ Order Confirmed!</p>
          </div>

          <p style="color: #333; font-size: 14px;">Hi <strong>${order.customerName}</strong>,</p>
          <p style="color: #666; font-size: 14px;">Your order has been placed successfully. Here's a summary:</p>

          <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; margin: 0 0 5px;">Order ID</p>
            <p style="font-size: 14px; font-weight: 600; color: #111; margin: 0;">#${order.id}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; font-size: 12px; color: #666;">Item</th>
                <th style="padding: 10px; text-align: right; font-size: 12px; color: #666;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 2px solid #eee; padding-top: 15px; margin-top: 10px;">
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="color: #666;">Subtotal</td><td style="text-align: right;">$${order.subtotal?.toFixed(2)}</td></tr>
              <tr><td style="color: #666;">Shipping</td><td style="text-align: right;">${order.shipping > 0 ? '$' + order.shipping.toFixed(2) : 'FREE'}</td></tr>
              <tr><td style="color: #666;">Tax</td><td style="text-align: right;">$${order.tax?.toFixed(2)}</td></tr>
              <tr>
                <td style="font-weight: 700; color: #111; padding-top: 10px;">Total</td>
                <td style="text-align: right; font-weight: 700; color: #111; padding-top: 10px; font-size: 18px;">
                  $${order.total?.toFixed(2)}
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 13px; font-weight: 600; color: #111; margin: 0 0 10px;">Payment Method</p>
            <p style="font-size: 13px; color: #666; margin: 0; text-transform: capitalize;">
              ${order.paymentMethod || 'Card'}
            </p>
          </div>

          ${order.shippingAddress?.street ? `
            <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="font-size: 13px; font-weight: 600; color: #111; margin: 0 0 10px;">Shipping Address</p>
              <p style="font-size: 13px; color: #666; margin: 0;">
                ${order.shippingAddress.street}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br/>
                ${order.shippingAddress.country}
              </p>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/orders"
               style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 500;">
              Track My Order
            </a>
          </div>
        </div>
      `;
    } else if (type === 'order-status-update') {
      const statusLabels: Record<string, string> = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      };
      subject = `Order Update: ${statusLabels[order.status] || order.status} - #${order.id.slice(0, 8)}`;
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #111;">rzzy</h1>
            <p style="color: #111; font-size: 16px; font-weight: 600;">📦 Order Status Updated</p>
          </div>

          <p style="color: #333; font-size: 14px;">Hi <strong>${order.customerName}</strong>,</p>
          <p style="color: #666; font-size: 14px;">
            Your order <strong>#${order.id.slice(0, 12)}</strong> status has been updated to:
          </p>

          <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="font-size: 20px; font-weight: 700; color: #111; margin: 0;">
              ${statusLabels[order.status] || order.status}
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; font-size: 12px; color: #666;">Item</th>
                <th style="padding: 10px; text-align: right; font-size: 12px; color: #666;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 2px solid #eee; padding-top: 15px; text-align: right;">
            <p style="font-size: 16px; font-weight: 700; color: #111;">
              Total: $${order.total?.toFixed(2)}
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/orders"
               style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 500;">
              View Order Details
            </a>
          </div>
        </div>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    if (SMTP_PASSWORD) {
      logDebug('Attempting SMTP email sending');
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

      try {
        await transporter.sendMail({
          from: `"rzzy" <${SMTP_USER}>`,
          to: order.customerEmail,
          subject,
          html,
        });
        logDebug('SMTP email sent successfully');
      } catch (smtpError: any) {
        logDebug(`SMTP error: ${smtpError.message}`);
        console.error('SMTP sending error:', smtpError);
        return NextResponse.json({ error: 'Failed to send email via SMTP', details: smtpError.message }, { status: 500 });
      }
    } else {
      logDebug('Attempting Resend email sending');
      let emailFrom = process.env.EMAIL_FROM || 'rzzy <orders@rzzy.studio>';
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

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailFrom,
          to: order.customerEmail,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        logDebug(`Resend error: ${errorText}`);
        console.error('Resend API error:', errorText);
        console.error(
          'TIP: If you receive a "validation_error" or "restricted" error, check that:\n' +
          '1. Your EMAIL_FROM domain is verified in Resend (Gmail/Yahoo/etc. are NOT supported as from addresses).\n' +
          '2. In sandbox mode, you can ONLY send emails to your verified owner email address (not arbitrary customers).'
        );
        return NextResponse.json({ error: 'Failed to send email', details: errorText }, { status: 500 });
      }
      logDebug('Resend email sent successfully');
    }

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (err: any) {
    logDebug(`Catch error: ${err.message}`);
    console.error('Email API error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
