import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await connectDB();

        // 1. Save to your MongoDB Ticket Tracker
        const newTicket = await Ticket.create({
            userName: body.name,
            userEmail: body.email,
            type: body.type || "Contact", // Contact, Feedback, or Bug
            subject: body.subject,
            message: body.message,
            workspaceId: body.workspaceId || null, // Null if from landing page
        });

        // 2. Define the SendGrid Email Structure
        const msg = {
            to: process.env.SUPPORT_EMAIL as string,
            from: process.env.SYSTEM_EMAIL as string,
            replyTo: body.email, // Allows you to hit "Reply" in your email client directly to the user!
            subject: `[HeadSaaS ${newTicket.type}] ${body.subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <div style="background-color: #4c1d95; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0; font-weight: 300;">New ${newTicket.type} Received</h2>
                    </div>
                    
                    <!-- Meta Info -->
                    <div style="padding: 20px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 10px 0; color: #334155;"><strong>From:</strong> ${body.name} (<a href="mailto:${body.email}" style="color: #6d28d9;">${body.email}</a>)</p>
                        <p style="margin: 0 0 10px 0; color: #334155;"><strong>Category:</strong> ${newTicket.type}</p>
                        ${body.workspaceId ? `<p style="margin: 0; color: #334155;"><strong>Workspace ID:</strong> ${body.workspaceId}</p>` : ''}
                    </div>

                    <!-- Message Body -->
                    <div style="padding: 30px 20px;">
                        <h3 style="margin-top: 0; color: #0f172a; font-size: 18px;">${body.subject}</h3>
                        <p style="color: #475569; white-space: pre-wrap; line-height: 1.6; font-size: 15px;">${body.message}</p>
                    </div>

                    <!-- Footer -->
                    <div style="padding: 15px 20px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">Ticket ID: ${newTicket._id}</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">HeadSaaS Automated Support System</p>
                    </div>
                </div>
            `,
        };

        // 3. Send the Email
        await sgMail.send(msg);

        return NextResponse.json({ success: true, data: newTicket });
    } catch (error: any) {
        console.error("SendGrid/Contact Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
