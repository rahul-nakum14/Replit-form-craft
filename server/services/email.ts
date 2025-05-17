import nodemailer from 'nodemailer';
import { MailService } from '@sendgrid/mail';

// Configure SendGrid if available
let sendgridMail: MailService | null = null;
if (process.env.SENDGRID_API_KEY) {
  sendgridMail = new MailService();
  sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configure SMTP transporter if available
let smtpTransporter: nodemailer.Transporter | null = null;
if (process.env.SMTP_HOST && 
    process.env.SMTP_PORT && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS) {
  
  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  // Verify connection
  smtpTransporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to take our messages');
    }
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Send an email using either SendGrid or SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, text, html } = options;
  const from = options.from || (process.env.SMTP_USER || 'noreply@formcraft.com');
  
  try {
    // Try SendGrid first if available
    if (sendgridMail) {
      await sendgridMail.send({
        to,
        from,
        subject,
        text,
        html
      });
      console.log('Email sent using SendGrid');
      return true;
    }
    
    // Fall back to SMTP if available
    if (smtpTransporter) {
      await smtpTransporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      });
      console.log('Email sent using SMTP');
      return true;
    }
    
    // No email service available
    console.warn('No email service configured. Cannot send email.');
    return false;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send a verification email
 */
export async function sendVerificationEmail(
  email: string, 
  token: string
): Promise<boolean> {
  const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
  
  return sendEmail({
    to: email,
    subject: 'Verify Your FormCraft Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Verify Your FormCraft Account</h2>
        <p>Thank you for signing up for FormCraft. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>If you did not create an account, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />
        <p style="color: #6B7280; font-size: 12px;">FormCraft - Create beautiful forms in minutes</p>
      </div>
    `
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string, 
  token: string
): Promise<boolean> {
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
  
  return sendEmail({
    to: email,
    subject: 'Reset Your FormCraft Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Reset Your FormCraft Password</h2>
        <p>You requested a password reset for your FormCraft account. Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />
        <p style="color: #6B7280; font-size: 12px;">FormCraft - Create beautiful forms in minutes</p>
      </div>
    `
  });
}

/**
 * Send a form submission notification
 */
export async function sendFormSubmissionNotification(
  ownerEmail: string,
  formTitle: string,
  formData: Record<string, any>
): Promise<boolean> {
  // Create a simple HTML table of the form data
  const dataRows = Object.entries(formData)
    .map(([key, value]) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #E5E7EB; font-weight: bold;">${key}</td>
        <td style="padding: 8px; border: 1px solid #E5E7EB;">${value}</td>
      </tr>
    `)
    .join('');
  
  return sendEmail({
    to: ownerEmail,
    subject: `New submission for: ${formTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Form Submission</h2>
        <p>You have received a new submission for your form: <strong>${formTitle}</strong></p>
        
        <h3>Submission Details:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tbody>
            ${dataRows}
          </tbody>
        </table>
        
        <p>You can view all submissions in your FormCraft dashboard.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />
        <p style="color: #6B7280; font-size: 12px;">FormCraft - Create beautiful forms in minutes</p>
      </div>
    `
  });
}