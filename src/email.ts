import nodemailer from "nodemailer";
import { Job } from "./types";

export interface EmailConfig {
  to: string;
  jobs: Job[];
}

export class EmailService {
  private static validateEnvironment(): void {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error(
        "❌ Email configuration missing. Please set SMTP_USER and SMTP_PASS environment variables."
      );
      console.error(
        "   For Gmail: SMTP_USER=your-gmail@gmail.com SMTP_PASS=your-app-password"
      );
      process.exit(1);
    }
  }

  private static createTransporter() {
    this.validateEnvironment();

    return nodemailer.createTransport({
      service: "gmail", // You can change this to other services like "outlook", "yahoo", etc.
      auth: {
        user: process.env.SMTP_USER, // Your email (the sender)
        pass: process.env.SMTP_PASS, // Your email password or app password
      },
    });
  }

  private static formatJobsHtml(jobs: Job[]): string {
    return `
      <h2>New UN Jobs Found</h2>
      <p>Found ${jobs.length} new job(s):</p>
      <ul>
        ${jobs
          .map(
            (job) =>
              `<li><strong>${job.title}</strong> - ${
                job.organization || "UN"
              }</li>`
          )
          .join("")}
      </ul>
      <p>Full details:</p>
      <pre>${JSON.stringify(jobs, null, 2)}</pre>
    `;
  }

  private static formatJobsText(jobs: Job[]): string {
    return `New UN Jobs Found\n\nFound ${
      jobs.length
    } new job(s):\n\n${JSON.stringify(jobs, null, 2)}`;
  }

  static async sendNewJobsNotification(config: EmailConfig): Promise<void> {
    if (config.jobs.length === 0) {
      console.log("📧 No new jobs found, email not sent.");
      return;
    }

    const transporter = this.createTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER, // From your configured email
      to: config.to, // To the recipient email provided via --email
      subject: `🆕 ${config.jobs.length} New UN Jobs Found`,
      html: this.formatJobsHtml(config.jobs),
      text: this.formatJobsText(config.jobs),
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `✅ Email sent successfully to ${config.to}: ${info.response}`
      );
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      throw error;
    }
  }
}
