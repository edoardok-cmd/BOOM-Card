import nodemailer, { Transporter } from 'nodemailer';
import { htmlToText } from 'html-to-text';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface VerificationEmailData {
  userName: string;
  verificationLink: string;
}

interface PasswordResetEmailData {
  userName: string;
  resetLink: string;
}

class EmailService {
  private transporter: Transporter;
  private fromEmail: string;
  private fromName: string;
  private isTestMode: boolean;

  constructor() {
    // Check if we're in test/development mode
    this.isTestMode = process.env.NODE_ENV !== 'production' || !process.env.SMTP_HOST;
    
    // Initialize transporter as null first
    this.transporter = null as any;
    
    // Set email defaults
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@boomcard.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'BOOM Card';
    
    // Initialize the transporter
    this.initializeTransporter();
  }
  
  private async initializeTransporter() {
    if (this.isTestMode) {
      // Use Ethereal Email for testing (catches all emails)
      await this.setupTestTransporter();
    } else {
      // Use production SMTP settings
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      });
      
      // Verify connection after transporter is created
      this.verifyConnection();
    }
  }

  private async setupTestTransporter() {
    // Create a test account if needed
    const testAccount = await nodemailer.createTestAccount();
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    console.log('📧 Email service running in TEST mode');
    console.log(`📧 Test email account: ${testAccount.user}`);
    
    // Verify connection after setting up test transporter
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
    } catch (error) {
      console.error('❌ Email service error:', error);
      if (!this.isTestMode) {
        console.error('Please check your SMTP configuration');
      }
    }
  }

  private async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || htmlToText(options.html, { wordwrap: 130 })
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 Email sent to ${options.to} - Message ID: ${info.messageId}`);

      const result: any = {
        success: true,
        messageId: info.messageId
      };

      // Get preview URL for test emails
      if (this.isTestMode) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          result.previewUrl = previewUrl;
          console.log(`📧 Preview URL: ${previewUrl}`);
        }
      }

      return result;
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${options.to}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  public async sendVerificationEmail(to: string, data: VerificationEmailData) {
    const subject = 'Verify Your BOOM Card Account';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">BOOM Card</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${data.userName}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for signing up for BOOM Card. To complete your registration and start 
            enjoying exclusive discounts, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationLink}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      font-size: 16px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If the button above doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <p style="color: #007bff; font-size: 14px; word-break: break-all;">
            ${data.verificationLink}
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create a BOOM Card account, 
            you can safely ignore this email.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 BOOM Card. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  public async sendPasswordResetEmail(to: string, data: PasswordResetEmailData) {
    const subject = 'Reset Your BOOM Card Password';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">BOOM Card</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi ${data.userName},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset your BOOM Card password. Click the button below 
            to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      font-size: 16px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If the button above doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <p style="color: #007bff; font-size: 14px; word-break: break-all;">
            ${data.resetLink}
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, 
            please ignore this email and your password will remain unchanged.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 BOOM Card. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  public async sendWelcomeEmail(to: string, userName: string) {
    const subject = 'Welcome to BOOM Card!';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">BOOM Card</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome aboard, ${userName}! 🎉</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your email has been verified and your BOOM Card account is now active!
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You can now start enjoying exclusive discounts at hundreds of partner locations. 
            Here's what you can do next:
          </p>
          
          <ul style="color: #666; font-size: 16px; line-height: 1.8;">
            <li>Browse our partner directory</li>
            <li>Generate your personal QR code</li>
            <li>Start saving on your purchases</li>
            <li>Leave reviews and earn rewards</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/partners" 
               style="background-color: #28a745; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      font-size: 16px; font-weight: bold;">
              Explore Partners
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 BOOM Card. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;