import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Configure email transporter 
// In production, you'd use a service like SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const { userId, partnerEmail } = await request.json();

    if (!userId || !partnerEmail) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the user that is sending the invitation
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the partner already has an account
    const existingPartner = await User.findOne({ email: partnerEmail });
    
    // Create an invitation token valid for 7 days
    const token = jwt.sign(
      { 
        inviterId: userId,
        partnerEmail,
        purpose: 'partner-invite'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Store the pending invitation in the user's record
    user.partnerInvitePending = true;
    await user.save();

    // The base URL for the application
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // The invitation accept URL - we'll create this route in the next step
    const inviteUrl = `${baseUrl}/register-with-invitation?token=${token}`;

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'wedding-app@example.com',
      to: partnerEmail,
      subject: `הזמנה לשיתוף ניהול החתונה מאת ${user.fullName}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333;">הזמנה לשיתוף ניהול החתונה</h2>
          <p>${user.fullName} הזמין/ה אותך לשתף בניהול החתונה באפליקציית Wedding App.</p>
          
          ${existingPartner 
            ? '<p>מכיוון שכבר יש לך חשבון במערכת, פשוט לחץ/י על הקישור למטה כדי להצטרף לחשבון המשותף.</p>' 
            : '<p>כדי להצטרף, תצטרך/י קודם כל ליצור חשבון במערכת ואז תועבר/י אוטומטית לחשבון המשותף.</p>'
          }
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${inviteUrl}" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              לחץ/י כאן להצטרפות
            </a>
          </div>
          
          <p>הקישור תקף ל-7 ימים.</p>
          <p>אם לא ביקשת הזמנה זו, אנא התעלם/י ממייל זה.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
            <p>בברכה,<br>צוות Wedding App</p>
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      message: 'Invitation sent successfully', 
      inviteSent: true 
    });

  } catch (error) {
    console.error('Error sending partner invitation:', error);
    return NextResponse.json(
      { message: 'Failed to send invitation', error: (error as Error).message },
      { status: 500 }
    );
  }
} 