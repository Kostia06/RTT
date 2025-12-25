import nodemailer from 'nodemailer';
import { OrderConfirmationEmail } from './templates/OrderConfirmationEmail';
import { render } from '@react-email/components';

// Email service configuration
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'console';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@respectthetechnique.com';
const FROM_NAME = process.env.FROM_NAME || 'Respect The Technique';

// Create transporter based on environment
function createTransporter() {
  if (EMAIL_PROVIDER === 'console') {
    // Development mode - no actual sending
    return null;
  }

  if (EMAIL_PROVIDER === 'smtp') {
    return nodemailer.createTransporter({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }

  // Add support for SendGrid, Mailgun, etc. in the future
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
    // Console mode - just log the email
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

  try {
    const info = await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
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
  const emailHtml = render(OrderConfirmationEmail(data));

  const subject = `Order Confirmation #${data.orderNumber} - Respect The Technique`;

  await sendEmail({
    to: data.customerEmail,
    subject,
    html: emailHtml,
  });

  console.log(`Order confirmation sent to ${data.customerEmail} for order #${data.orderNumber}`);
}

// Password reset email (for future use)
interface PasswordResetData {
  email: string;
  resetToken: string;
  resetUrl: string;
}

export async function sendPasswordReset(data: PasswordResetData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #000;">Reset Your Password</h1>
      <p>You requested to reset your password for your Respect The Technique account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${data.resetUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; margin: 20px 0;">
        Reset Password
      </a>
      <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: data.email,
    subject: 'Reset Your Password - Respect The Technique',
    html,
  });
}

// Welcome email (for future use)
interface WelcomeEmailData {
  email: string;
  name: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #000;">Welcome to Respect The Technique!</h1>
      <p>Hi ${data.name},</p>
      <p>Thank you for creating an account with Respect The Technique. We're excited to have you join our community!</p>
      <p>Browse our authentic ramen bowls, retail products, and merchandise:</p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/shop" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; margin: 20px 0;">
        Start Shopping
      </a>
      <p>If you have any questions, feel free to reach out to us.</p>
      <p style="margin-top: 40px;">Best regards,<br/>The Respect The Technique Team</p>
    </div>
  `;

  await sendEmail({
    to: data.email,
    subject: 'Welcome to Respect The Technique!',
    html,
  });
}
