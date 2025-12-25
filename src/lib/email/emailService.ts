import nodemailer, { Transporter } from 'nodemailer';
import { OrderConfirmationEmail } from './templates/OrderConfirmationEmail';
import { render } from '@react-email/components';

// Email service configuration
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'console';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@respectthetechnique.com';
const FROM_NAME = process.env.FROM_NAME || 'Respect The Technique';

// Create transporter based on environment
function createTransporter(): Transporter | null {
  if (EMAIL_PROVIDER === 'console') {
    return null;
  }

  if (EMAIL_PROVIDER === 'smtp') {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }

  throw new Error(`Unsupported email provider: ${EMAIL_PROVIDER}`);
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n=== EMAIL NOTIFICATION ===');
    console.log('To:', to);
    console.log('From:', `${FROM_NAME} <${FROM_EMAIL}>`);
    console.log('Subject:', subject);
    console.log('\n--- HTML Body ---');
    console.log(html);
    if (text) {
      console.log('\n--- Text Body ---');
      console.log(text);
    }
    console.log('========================\n');
    return { success: true, mode: 'console' };
  }

  const info = await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  });

  return { success: true, messageId: info.messageId };
}

// Order confirmation email
interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    variantName?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  fulfillmentType: 'delivery' | 'pickup';
  scheduledDate?: string;
}

export async function sendOrderConfirmation(data: OrderConfirmationData) {
  const emailHtml = await render(OrderConfirmationEmail(data));

  const subject = `Order Confirmation #${data.orderNumber} - Respect The Technique`;

  await sendEmail({
    to: data.customerEmail,
    subject,
    html: emailHtml,
  });
}

// Password reset email
interface PasswordResetData {
  email: string;
  resetToken: string;
  resetUrl: string;
}

export async function sendPasswordReset(data: PasswordResetData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #000;">Reset Your Password</h1>
      <p>You requested to reset your password.</p>
      <a href="${data.resetUrl}">Reset Password</a>
    </div>
  `;

  await sendEmail({
    to: data.email,
    subject: 'Reset Your Password - Respect The Technique',
    html,
  });
}

// Welcome email
interface WelcomeEmailData {
  email: string;
  name: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Welcome to Respect The Technique!</h1>
      <p>Hi ${data.name},</p>
    </div>
  `;

  await sendEmail({
    to: data.email,
    subject: 'Welcome to Respect The Technique!',
    html,
  });
}
