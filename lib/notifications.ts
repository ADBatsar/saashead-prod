import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

/**
 * 1. Send Welcome Notification (New User)
 */
export async function sendWelcomeNotification(name: string, email: string, phone: string) {
    try {
        // Send SMS/WhatsApp
        const smsMessage = `Hi ${name}, welcome to HeadSaaS! Your account has been successfully created. You can now log in securely using this mobile number.`;
        await twilioClient.messages.create({
            body: smsMessage,
            from: process.env.TWILIO_PHONE_NUMBER, // Use TWILIO_WHATSAPP_NUMBER if using WhatsApp
            to: phone
        });

        // Send Email
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL as string, // e.g., no-reply@headsaas.com
            subject: 'Welcome to HeadSaaS!',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Welcome to HeadSaaS, ${name}!</h2>
                    <p>Your account has been successfully created by your administrator.</p>
                    <p>You can now log in to your portal using your registered mobile number: <strong>${phone}</strong></p>
                    <br/>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Log In Now</a>
                </div>
            `,
        };
        await sgMail.send(msg);
        
        console.log(`✅ Welcome notifications sent to ${email} and ${phone}`);
    } catch (error) {
        console.error("❌ Error sending welcome notifications:", error);
    }
}

/**
 * 2. Send Application Assignment Notification
 */
export async function sendAppAssignmentNotification(name: string, email: string, phone: string, appName: string) {
    try {
        // Send SMS/WhatsApp
        const smsMessage = `Hi ${name}, you have just been granted access to the application: ${appName} on HeadSaaS. Log in to view your credentials/details.`;
        await twilioClient.messages.create({
            body: smsMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });

        // Send Email
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: `You have been assigned to ${appName}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Hello ${name},</h2>
                    <p>You have been newly assigned to the application: <strong>${appName}</strong>.</p>
                    <p>Please log in to your HeadSaaS dashboard to view your assignment details, licenses, or credentials.</p>
                    <br/>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
                </div>
            `,
        };
        await sgMail.send(msg);
        
        console.log(`✅ App assignment notifications sent to ${email} and ${phone} for ${appName}`);
    } catch (error) {
        console.error("❌ Error sending app assignment notifications:", error);
    }
}
