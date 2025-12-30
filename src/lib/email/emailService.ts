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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #000;
          color: #fff;
          padding: 40px 20px;
          text-align: center;
        }
        .content {
          padding: 40px 20px;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background-color: #000;
          color: #fff;
          text-decoration: none;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 30px 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/images/logo.png" alt="Respect The Technique" style="max-width: 200px; height: auto; margin-bottom: 20px;" />
          <h1>RESPECT THE TECHNIQUE</h1>
        </div>
        <div class="content">
          <h2 style="color: #000;">Reset Your Password</h2>
          <p>You requested to reset your password for your Respect The Technique account.</p>
          <p>Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${data.resetUrl}" class="button">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you didn't request this password reset, you can safely ignore this email.
          </p>
          <p style="font-size: 14px; color: #666;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Respect The Technique</strong></p>
          <p style="margin: 5px 0;">Authentic Ramen & Japanese Cuisine</p>
          <p style="margin: 5px 0;">Edmonton, Alberta, Canada</p>
        </div>
      </div>
    </body>
    </html>
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #000;
          color: #fff;
          padding: 40px 20px;
          text-align: center;
        }
        .content {
          padding: 40px 20px;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background-color: #000;
          color: #fff;
          text-decoration: none;
          font-weight: bold;
          margin: 20px 0;
        }
        .feature-list {
          background-color: #f9f9f9;
          padding: 20px;
          border-left: 4px solid #000;
          margin: 20px 0;
        }
        .feature-list ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .feature-list li {
          margin: 8px 0;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 30px 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/images/logo.png" alt="Respect The Technique" style="max-width: 200px; height: auto; margin-bottom: 20px;" />
          <h1>RESPECT THE TECHNIQUE</h1>
        </div>
        <div class="content">
          <h2 style="color: #000;">Welcome to Respect The Technique!</h2>
          <p>Hi ${data.name},</p>
          <p>Thank you for creating an account with us! We're excited to have you join our community of ramen enthusiasts.</p>

          <div class="feature-list">
            <p style="margin-top: 0; font-weight: bold;">What you can do now:</p>
            <ul>
              <li>Browse our authentic ramen products and ingredients</li>
              <li>Explore traditional recipes and cooking techniques</li>
              <li>Place orders for pickup or delivery</li>
              <li>Track your order history and preferences</li>
            </ul>
          </div>

          <p>Ready to get started?</p>
          <div style="text-align: center;">
            <a href="${baseUrl}/shop" class="button">Start Shopping</a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions, feel free to reach out to us at
            <a href="mailto:support@respectthetechnique.com" style="color: #000;">support@respectthetechnique.com</a>
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Respect The Technique</strong></p>
          <p style="margin: 5px 0;">Authentic Ramen & Japanese Cuisine</p>
          <p style="margin: 5px 0;">Edmonton, Alberta, Canada</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: data.email,
    subject: 'Welcome to Respect The Technique!',
    html,
  });
}
