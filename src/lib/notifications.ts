import { Order } from './types';

const API_BASE = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

export async function sendOrderConfirmationToCustomer(order: Order): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/notifications/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order-confirmation',
        order,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
    return false;
  }
}

export async function sendOrderStatusUpdateToCustomer(order: Order): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/notifications/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order-status-update',
        order,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to send status update email:', err);
    return false;
  }
}

export async function sendOrderNotificationToOwner(order: Order): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/notifications/owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to send owner notification:', err);
    return false;
  }
}
