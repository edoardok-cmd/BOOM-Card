import nodemailer, { Transporter } from 'nodemailer';
import config from 'config';
import * as path from 'path';
import * as fs from 'fs';
import handlebars from 'handlebars';
import { BoomError } from '../utils/errors'; // Assuming a custom error utility for project-specific errors

/**
 * Interface for SMTP server configuration.
 */
interface SMTPOptions {
  host: string;
  port: number;
  secure: boolean; // true for 465, false for other ports
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Interface for the context data passed to email templates.
 */
interface EmailContext {
  [key: string]: any; // Allows any key-value pair for template variables
}

/**
 * Interface for email sending options.
 */
export interface EmailOptions {
  to: string | string[]; // Single recipient or array of recipients
  subject: string;
  template: string; // Name of the email template file (without extension), e.g., 'welcome', 'password-reset'
  context: EmailContext; // Data to be rendered in the template
  // Add other optional fields like cc, bcc, attachments if needed later
}

/**
 * Global Nodemailer transporter instance. Initialized once the config is loaded.
 */
let transporter: Transporter;

/**
 * Configuration for the email sender.
 * Loaded from `config` module (e.g., `config/default.json` or environment variables).
 */
const SENDER_EMAIL: string = config.get<string>('email.sender');
const SENDER_NAME: string = config.get<string>('email.senderName');

/**
 * SMTP configuration details.
 * Loaded from `config` module.
 */
const SMTP_CONFIG: SMTPOptions = {
  host: config.get<string>('email.smtp.host'),
  port: config.get<number>('email.smtp.port'),
  secure: config.get<boolean>('email.smtp.secure'),
  auth: {
    user: config.get<string>('email.smtp.user'),
    pass: config.get<string>('email.smtp.pass'),
  },
};

/**
 * Directory where email templates are stored.
 * Assumes templates are in `project_root/templates/emails`.
 */
const TEMPLATES_DIR: string = path.join(__dirname, '../../templates/emails');

import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { htmlToText } from 'html-to-text';
import config from '../config/config'; // Assuming config is properly defined
import logger from '../config/logger'; // Assuming logger is properly defined

// --- Re-declaring assumed interfaces from Part 1 for clarity ---
// These interfaces would typically be defined in a types/interfaces file or in Part 1.
interface IEmailServiceConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string; // The default 'from' email address
}

interface IVerificationEmailData {
    userName: string;
    verificationLink: string;
}

interface IPasswordResetEmailData {
    userName: string;
    resetLink: string;
}

interface ITransactionEmailData {
    userName: string;
    cardHolderName: string;
    cardNumberLast4: string;
    merchantName: string;
    amount: number;
    currency: string;
    transactionDate: string; // e.g., "YYYY-MM-DD HH:MM AM/PM"
    transactionType: 'purchase' | 'refund' | 'deposit' | 'withdrawal';
    currentBalance: number; // User's balance after the transaction
    transactionId?: string;
    // Add any other fields relevant for transaction emails
}
// --- End of assumed interfaces from Part 1 ---

// Define the base path for email templates
const TEMPLATE_BASE_PATH = path.join(__dirname, '../templates/emails');

class EmailService {
    private transporter: Transporter;
    private fromEmail: string;

    constructor() {
        // Validate essential email configuration
        if (!config.email || !config.email.host || !config.email.auth || !config.email.auth.user || !config.email.auth.pass || !config.email.from) {
            logger.error('Critical email service configuration is missing. Please check config/config.ts');
            throw new Error('Email service configuration incomplete. Cannot initialize.');
        }

        // Initialize Nodemailer transporter
        this.transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.secure, // true for port 465, false for other ports
            auth: {
                user: config.email.auth.user,
                pass: config.email.auth.pass,
            },
            // Consider adding tls options if you are using self-signed certificates or specific environments
            // tls: {
            //     rejectUnauthorized: false
            // } as nodemailer.TransportOptions); // Cast to TransportOptions to satisfy TypeScript

        this.fromEmail = config.email.from;

        // Verify the connection configuration
        this.transporter.verify((error, success) => {
            if (error) {
                logger.error(`Email transporter connection failed: ${error.message}`);
                // In a production environment, you might want to alert ops or use a fallback.
            } else {
                logger.info('Email transporter connected successfully');
            });
    }

    /**
     * Compiles an HTML email template using Handlebars and provides the context data.
     * @param templateName The name of the template file (e.g., 'verification.html').
     * @param context The data object to be injected into the template.
     * @returns A Promise that resolves to the compiled HTML string.
     * @throws Error if the template cannot be read or compiled.
     */
    private async _compileTemplate(templateName: string, context: Record<string, any>): Promise<string> {
        const templatePath = path.join(TEMPLATE_BASE_PATH, templateName);
        try {
            const templateSource = await fs.promises.readFile(templatePath, 'utf8');
            const template = handlebars.compile(templateSource);
            return template(context);
        } catch (error) {
            logger.error(`Error compiling email template ${templateName}:`, error);
            throw new Error(`Failed to compile email template: ${templateName}. Ensure the file exists and is accessible.`);
        }

    /**
     * Sends a generic email using the configured Nodemailer transporter.
     * This is a private helper method used by specific email sending functions.
     * @param to The recipient's email address.
     * @param subject The subject line of the email.
     * @param htmlContent The HTML body of the email.
     * @param textContent The plain text body of the email (fallback, good for deliverability).
     * @returns A Promise that resolves when the email is sent.
     * @throws Error if the email fails to send.
     */
    private async _sendEmail(to: string, subject: string, htmlContent: string, textContent: string): Promise<void> {
        const mailOptions = {
            from: this.fromEmail,
            to: to,
            subject: subject,
            html: htmlContent,
            text: textContent,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`Email successfully sent to ${to} with subject: "${subject}"`);
        } catch (error) {
            logger.error(`Failed to send email to ${to} with subject "${subject}":`, error);
            throw new Error(`Failed to send email: ${error.message}`);
        }

    /**
     * Sends an account verification email to a newly registered user.
     * @param to The recipient's email address.
     * @param data An object containing `userName` and `verificationLink`.
     * @returns A Promise that resolves when the email is sent.
     * @throws Error if the email fails to be sent.
     */
    public async sendVerificationEmail(to: string, data: IVerificationEmailData): Promise<void> {
        const subject = 'Verify Your BOOM Card Account';
        try {
            const html = await this._compileTemplate('verification.html', data);
            const text = htmlToText(html, { wordwrap: 130 }); // Convert HTML to plain text for email clients that don't render HTML
            await this._sendEmail(to, subject, html, text);
        } catch (error) {
            logger.error(`Failed to send verification email to ${to}:`, error);
            throw error; // Re-throw to allow caller to handle or propagate
        }

    /**
     * Sends a password reset email with a link to reset the user's password.
     * @param to The recipient's email address.
     * @param data An object containing `userName` and `resetLink`.
     * @returns A Promise that resolves when the email is sent.
     * @throws Error if the email fails to be sent.
     */
    public async sendPasswordResetEmail(to: string, data: IPasswordResetEmailData): Promise<void> {
        try {
            await this._sendEmail(to, subject, html, text);
        } catch (error) {
            logger.error(`Failed to send password reset email to ${to}:`, error);
            throw error;
        }

    /**
     * Sends a transaction notification email to a user after a transaction occurs.
     * @param to The recipient's email address.
     * @param data An object containing detailed transaction information.
     * @returns A Promise that resolves when the email is sent.
     * @throws Error if the email fails to be sent.
     */
    public async sendTransactionNotification(to: string, data: ITransactionEmailData): Promise<void> {
        // Prepare data for templating, especially for currency and date formatting
        const formattedData = {
            ...data,
            // Format amount and balance to two decimal places
            amount: data.amount.toFixed(2),
            currentBalance: data.currentBalance.toFixed(2),
            // Example: Format transaction date if it's not already in desired string format
            // transactionDate: new Date(data.transactionDate).toLocaleString('en-US', {
            //     year: 'numeric', month: 'short', day: 'numeric',
            //     hour: 'numeric', minute: 'numeric', hour12: true
            // }),
            // Capitalize transaction type for display
            displayTransactionType: data.transactionType.charAt(0).toUpperCase() + data.transactionType.slice(1),
        };

        try {
            await this._sendEmail(to, subject, html, text);
        } catch (error) {
            logger.error(`Failed to send transaction notification email to ${to}:`, error);
            throw error;
        }

    // You can add more specific email sending methods here as your application grows,
    // e.g., sendPromotionalEmail, sendAccountActivityAlert, etc.
}

// Export a singleton instance of the EmailService to be used across the application.
// This ensures only one transporter instance is created and managed.
const emailService = new EmailService();
export default emailService;

// backend/src/services/email.service.ts

// IMPORTANT: This PART 3 assumes the following have been defined in PART 1 and PART 2:
// 1. `import nodemailer from 'nodemailer';`
// 2. `import dotenv from 'dotenv'; dotenv.config();`
// 3. The `transporter` object has been configured and verified:
//    const transporter = nodemailer.createTransport({...});
//    transporter.verify((error, success) => { /* ... */ });

// --- START OF PART 3: Helper Functions, Error Handling, and Exports ---

/**
 * Interface for the data passed to email templates.
 * Allows for flexible key-value pairs.
 */
interface EmailTemplateData {
    [key: string]: string | number;
}

/**
 * A collection of predefined email templates for BOOM Card.
 * Each template is a function that takes dynamic data and returns an HTML string.
 * In a more complex application, these templates would likely be loaded from
 * separate `.html` or template files and rendered by a dedicated templating engine
 * (e.g., Handlebars, EJS, Pug). For simplicity, they are defined inline here.
 */
const emailTemplates = {
    /**
     * Generates the HTML for a welcome email.
     * @param data - Expected: `{ userName: string, loginLink: string }`
     */
    welcome: (data: EmailTemplateData) => `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                <h2 style="color: #4CAF50; text-align: center;">Welcome to BOOM Card, ${data.userName}!</h2>
                <p>Thank you for joining our community. We're excited to have you on board and help you manage your finances with ease.</p>
                <p>Start exploring BOOM Card today:</p>
                <p style="text-align: center; margin: 25px 0;">
                    <a href="${data.loginLink}" 
                       style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                              text-align: center; text-decoration: none; display: inline-block; 
                              border-radius: 5px; font-weight: bold; font-size: 16px;">
                        Log In to Your Account
                    </a>
                </p>
                <p>If you have any questions or need assistance, our support team is always here to help. Feel free to reach out!</p>
                <p>Best regards,<br/>The BOOM Card Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px; margin-bottom: 15px;">
                <p style="font-size: 0.8em; color: #666; text-align: center;">
                    This is an automated email. Please do not reply directly to this message.
                </p>
            </div>
        </div>
    `,

    /**
     * Generates the HTML for a password reset email.
     * @param data - Expected: `{ resetLink: string, expiresInMinutes: number }`
     */
    passwordReset: (data: EmailTemplateData) => `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                <h2 style="color: #008CBA; text-align: center;">Password Reset Request</h2>
                <p>You have requested to reset the password for your BOOM Card account.</p>
                <p>Please click on the link below to securely reset your password:</p>
                <p style="text-align: center; margin: 25px 0;">
                    <a href="${data.resetLink}" 
                       style="background-color: #008CBA; color: white; padding: 12px 25px; 
                              text-align: center; text-decoration: none; display: inline-block; 
                              border-radius: 5px; font-weight: bold; font-size: 16px;">
                        Reset Your Password
                    </a>
                </p>
                <p>This link will expire in <strong>${data.expiresInMinutes} minutes</strong> for security reasons. Please use it promptly.</p>
                <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
                <p>Best regards,<br/>The BOOM Card Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px; margin-bottom: 15px;">
                <p style="font-size: 0.8em; color: #666; text-align: center;">
                    If you're having trouble clicking the "Reset Your Password" link, copy and paste the URL below into your web browser:<br>
                    <a href="${data.resetLink}" style="color: #008CBA; word-break: break-all;">${data.resetLink}</a>
                </p>
            </div>
        </div>
    `,
    // Add more templates here as your application requires, e.g.:
    // transactionConfirmation: (data: EmailTemplateData) => `...`,
    // accountNotification: (data: EmailTemplateData) => `...`,
};

/**
 * Helper function to retrieve and render the HTML content for a given email template.
 * @param templateName - The key of the template function to use from `emailTemplates`.
 * @param data - The data object to pass to the template function for dynamic content.
 * @returns The generated HTML string, or a generic fallback if the template is not found.
 */
function getEmailHtml(templateName: keyof typeof emailTemplates, data: EmailTemplateData): string {
    const templateFunction = emailTemplates[templateName];
    if (templateFunction) {
        return templateFunction(data);
    }

    // Log a warning if the specified template is not found
    console.warn(`Email template "${templateName}" not found. Using a generic fallback message.`);
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                <h2 style="color: #FFC107; text-align: center;">Important Notification from BOOM Card</h2>
                <p>Hello,</p>
                <p>You are receiving this email because of an activity related to your BOOM Card account.</p>
                <p>If you have any questions or concerns, please do not hesitate to contact our support team.</p>
                <p>Best regards,<br/>The BOOM Card Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px; margin-bottom: 15px;">
                <p style="font-size: 0.8em; color: #666; text-align: center;">
                    This is an automated email. Please do not reply.
                </p>
            </div>
        </div>
    `;
}

/**
 * Defines the structure for options when sending an email through this service.
 */
interface EmailOptions {
    to: string;                                  // Recipient's email address
    subject: string;                             // Subject line of the email
    templateName: keyof typeof emailTemplates;   // The name of the template to use
    templateData?: EmailTemplateData;            // Optional data for dynamic content in the template
    attachments?: any[];                         // Optional array of Nodemailer attachment objects
}

/**
 * Sends an email using the configured Nodemailer transporter and a specified template.
 * Includes basic error handling and logging.
 *
 * @param options - An object conforming to `EmailOptions` with all necessary email details.
 * @returns A Promise resolving to an object indicating success or failure, along with a message.
 *          If an error occurs, the error details are also included.
 */
async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string; error?: any }> {
    const { to, subject, templateName, templateData = {}, attachments = [] } = options;

    try {
        // Generate the HTML content for the email using the chosen template
        const htmlContent = getEmailHtml(templateName, templateData);

        // Generate a plain text version of the email for clients that don't render HTML
        // This is a crucial fallback for accessibility and compatibility.
        const textContent = `BOOM Card Notification - ${subject}\n\n` +
                            `Hello ${templateData.userName || 'User'},\n\n` +
                            `You are receiving this email regarding: "${subject}".\n\n` +
                            `Details:\n${JSON.stringify(templateData, null, 2)}\n\n` +
                            `Please visit our website at ${process.env.FRONTEND_URL || 'your website link'} for more information.\n\n` +
                            `Best regards,\nThe BOOM Card Team`;

        // Construct the mail options object for Nodemailer
            from: process.env.EMAIL_FROM || 'noreply@boomcard.com', // Sender's email address (from .env or default)
            to: to,
            subject: subject,
            html: htmlContent,
            text: textContent,
            attachments: attachments,
        };

        // Send the email using the `transporter` defined in previous parts.
        // Assuming `transporter` is in scope (e.g., defined at the top of this file).
        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent to ${to}. Message ID: ${info.messageId}`);

        // In development/test environments, log the Ethereal.email preview URL if available
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            console.log('Email Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, message: `Email sent successfully to ${to}. Message ID: ${info.messageId}` };
    } catch (error: any) {
        // Error Handler: Log the error and return a failure status.
        // In a production application, you might also:
        // - Re-throw a custom `EmailServiceError`.
        // - Integrate with an error monitoring service (e.g., Sentry, Bugsnag).
        // - Implement retry mechanisms for transient errors.
        console.error(`Failed to send email to ${to} (Subject: "${subject}", Template: "${templateName}"):`, error);
        return { success: false, message: `Failed to send email to ${to}.`, error: error.message || 'Unknown email sending error' };
    }

// --- Export Statements ---
// These exports make the functions and objects available for other modules to import and use.

export {
    sendEmail,         // The primary function to send emails
    getEmailHtml,      // Helper to generate HTML directly (useful for testing templates)
    emailTemplates,    // The collection of template functions (useful for direct access or mocking in tests)
};

// --- Module Exports (Alternative for CommonJS) ---
// If your project uses CommonJS modules (e.g., `module.exports` syntax, often with `target: "es5"`
// or `module: "commonjs"` in `tsconfig.json` and no `"type": "module"` in `package.json`),
// you would typically use the following instead of the `export {}` statement above:

/*
module.exports = {
    sendEmail,
    getEmailHtml,
    emailTemplates,
};
*/

}
}
}
}
}
}
}
