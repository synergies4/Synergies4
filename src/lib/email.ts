import { Resend } from 'resend';

let resend: Resend | null = null;

// Initialize Resend only when we have an API key
function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  if (!resend) {
    throw new Error('Resend API key is not configured');
  }
  return resend;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
}

export interface PasswordResetData {
  email: string;
  resetLink: string;
  userName?: string;
}

export interface WelcomeEmailData {
  email: string;
  userName: string;
  loginLink: string;
}

export class EmailService {
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@synergies4ai.com';
  }

  private async sendEmail(options: EmailOptions) {
    try {
      // Ensure we have either html or text content
      if (!options.html && !options.text) {
        throw new Error('Email must have either HTML or text content');
      }

      const emailOptions: any = {
        from: options.from || this.fromEmail,
        to: options.to,
        subject: options.subject,
      };

      if (options.html) {
        emailOptions.html = options.html;
      }

      if (options.text) {
        emailOptions.text = options.text;
      }

      const { data, error } = await getResendClient().emails.send(emailOptions);

      if (error) {
        console.error('Email send error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  async sendContactForm(data: ContactFormData) {
    const { name, email, subject = 'New Contact Form Submission', message, phone, company } = data;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin: 0 0 15px 0;">Contact Details</h2>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            ${phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
            ${company ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${company}</p>` : ''}
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Message</h3>
            <p style="line-height: 1.6; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">This message was sent from the Synergies4 contact form.</p>
        </div>
      </div>
    `;

    // Send to admin
    await this.sendEmail({
      to: 'admin@synergies4ai.com', // Replace with your admin email
      subject: `[Contact Form] ${subject}`,
      html,
    });

    // Send confirmation to user
    const confirmationHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Contacting Us!</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1f2937;">Hi ${name},</h2>
          <p style="line-height: 1.6; color: #4b5563;">
            Thank you for reaching out to us! We've received your message and will get back to you within 24 hours.
          </p>
          
          <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; margin: 20px 0;">
            <h3 style="color: #0d9488; margin: 0 0 10px 0;">Your Message:</h3>
            <p style="margin: 0; color: #374151;">"${message}"</p>
          </div>
          
          <p style="line-height: 1.6; color: #4b5563;">
            In the meantime, feel free to explore our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/courses" style="color: #0d9488;">courses</a> 
            or try our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/synergize" style="color: #0d9488;">AI Assistant</a>.
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">Best regards,<br>The Synergies4 Team</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Thank you for contacting Synergies4!',
      html: confirmationHtml,
    });

    return { success: true };
  }

  async sendPasswordReset(data: PasswordResetData) {
    const { email, resetLink, userName = 'there' } = data;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1f2937;">Hi ${userName},</h2>
          <p style="line-height: 1.6; color: #4b5563;">
            We received a request to reset your password for your Synergies4 account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="line-height: 1.6; color: #6b7280; font-size: 14px;">
            If you didn't request this password reset, please ignore this email. 
            This link will expire in 24 hours for security reasons.
          </p>
          
          <p style="line-height: 1.6; color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #0d9488; word-break: break-all;">${resetLink}</a>
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">For security reasons, this link will expire in 24 hours.</p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Reset Your Synergies4 Password',
      html,
    });
  }

  async sendWelcomeEmail(data: WelcomeEmailData) {
    const { email, userName, loginLink } = data;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Synergies4!</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1f2937;">Welcome ${userName}!</h2>
          <p style="line-height: 1.6; color: #4b5563;">
            Thank you for joining Synergies4! We're excited to help you accelerate your professional growth 
            with our AI-powered learning platform.
          </p>
          
          <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0d9488; margin: 0 0 15px 0;">🚀 Get Started:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li style="margin-bottom: 8px;">Explore our expert-led courses</li>
              <li style="margin-bottom: 8px;">Try our AI-powered assistant</li>
              <li style="margin-bottom: 8px;">Join our community of learners</li>
              <li>Earn industry-recognized certifications</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" 
               style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;">
              Start Learning Now
            </a>
          </div>
          
          <p style="line-height: 1.6; color: #4b5563;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">Happy learning!<br>The Synergies4 Team</p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Welcome to Synergies4 - Start Your Learning Journey!',
      html,
    });
  }

  async sendNewsletterConfirmation(email: string, name?: string) {
    const displayName = name || 'there';

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Newsletter Subscription Confirmed!</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1f2937;">Hi ${displayName},</h2>
          <p style="line-height: 1.6; color: #4b5563;">
            Thank you for subscribing to our newsletter! You'll now receive the latest insights on:
          </p>
          
          <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li style="margin-bottom: 8px;">AI and technology trends</li>
              <li style="margin-bottom: 8px;">Leadership development tips</li>
              <li style="margin-bottom: 8px;">Professional growth strategies</li>
              <li style="margin-bottom: 8px;">Course updates and new releases</li>
              <li>Exclusive offers and early access</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">You can unsubscribe at any time by clicking the link at the bottom of our emails.</p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Welcome to Synergies4 Newsletter!',
      html,
    });
  }
}

export const emailService = new EmailService(); 