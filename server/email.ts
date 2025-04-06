import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import logger, { LogLevel } from './logger';

// Ensure environment variables are loaded
dotenv.config();

interface EmailResponse {
  success: boolean;
  data?: any;
  error?: any;
  message?: string;
}

/**
 * Service for sending emails via Mailgun API
 */
export class EmailService {
  private apiKey: string;
  private domain: string;
  private baseUrl: string = 'https://api.mailgun.net/v3';
  private isConfigured: boolean;

  constructor() {
    // Log the environment variables for debugging
    logger(`Initializing EmailService with available configurations`, LogLevel.INFO);

    this.apiKey = process.env.MAILGUN_API_KEY || '';
    this.domain = process.env.MAILGUN_DOMAIN || 'sandbox66d1a5b49bb14e669e798d731677ddf3.mailgun.org';
    this.isConfigured = Boolean(this.apiKey && this.domain);

    // Log configuration status (without revealing the full API key)
    const keyStatus = this.apiKey ? 
      `Found (${this.apiKey.substring(0, 5)}...${this.apiKey.substring(this.apiKey.length - 4)})` : 
      'Not found';

    logger(`EmailService Configuration:`, LogLevel.INFO, {
      apiKeyStatus: keyStatus,
      domain: this.domain,
      isConfigured: this.isConfigured
    });

    if (!this.apiKey) {
      logger('MAILGUN_API_KEY environment variable is not set', LogLevel.ERROR);
    }

    if (!this.domain) {
      logger('MAILGUN_DOMAIN environment variable is not set', LogLevel.ERROR);
    }
  }

  /**
   * Validates if the email configuration is complete
   */
  public isValidConfiguration(): boolean {
    return this.isConfigured;
  }

  /**
   * Sends a simple email message
   */
  async sendSimpleMessage(
    to: string,
    subject: string,
    text: string,
    from: string = `AI Thought Pipeline <postmaster@${this.domain}>`
  ): Promise<EmailResponse> {
    // Validate configuration
    if (!this.isConfigured) {
      logger('Email service is not properly configured', LogLevel.ERROR);
      return {
        success: false,
        message: 'Email service is not properly configured. Please set MAILGUN_API_KEY and MAILGUN_DOMAIN in .env file.'
      };
    }

    // Validate input
    if (!to || !subject || !text) {
      logger('Missing required email parameters', LogLevel.ERROR, { to, subject });
      return {
        success: false,
        message: 'Missing required email parameters: to, subject, text'
      };
    }

    try {
      const formData = new FormData();
      formData.append('from', from);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('text', text);

      logger(`Sending email to ${to}`, LogLevel.INFO, { subject });

      const response = await axios.post(
        `${this.baseUrl}/${this.domain}/messages`,
        formData,
        {
          auth: {
            username: 'api',
            password: this.apiKey
          },
          headers: formData.getHeaders()
        }
      );

      logger('Email sent successfully', LogLevel.INFO, { messageId: response.data.id });

      return {
        success: true,
        data: response.data,
        message: 'Email sent successfully'
      };
    } catch (error: any) {
      let errorMessage = 'Unknown error occurred';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`;
        logger('Email API error response', LogLevel.ERROR, { 
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from email service';
        logger('No response from email API', LogLevel.ERROR, { request: error.request });
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Error setting up email request';
        logger('Email setup error', LogLevel.ERROR, { message: error.message });
      }

      return {
        success: false,
        error: error,
        message: errorMessage
      };
    }
  }

  /**
   * Sends a notification email to the development team
   */
  async sendNotification(
    subject: string,
    content: string,
    notificationType: 'info' | 'warning' | 'error' = 'info'
  ): Promise<EmailResponse> {
    // Use developer email from environment or fallback
    const devEmail = process.env.DEVELOPER_EMAIL || 'dev@example.com';

    // Format the subject based on notification type
    const formattedSubject = `[${notificationType.toUpperCase()}] ${subject}`;

    // Add standard footer to all notification emails
    const formattedContent = `
${content}

--
This is an automated notification from the AI Thought Pipeline system.
Environment: ${process.env.NODE_ENV || 'development'}
Time: ${new Date().toISOString()}
    `;

    return this.sendSimpleMessage(devEmail, formattedSubject, formattedContent);
  }
}