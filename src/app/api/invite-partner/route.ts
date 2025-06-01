import { NextResponse } from 'next/server';
import connectToDatabase from '../../../utils/dbConnect';
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
    const { userId, partnerEmail, partnerName, partnerPhone } = await request.json();

    if (!userId || !partnerEmail) {
      return NextResponse.json(
        { success: false, message: 'נתונים חסרים' },
        { status: 400 }
      );
    }

    // חיבור למסד הנתונים
    await connectToDatabase();

    // מציאת המשתמש
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'משתמש לא נמצא' },
        { status: 404 }
      );
    }

    // בדיקה שהאימייל עדיין לא רשום במערכת
    const existingUser = await User.findOne({ email: partnerEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'כתובת האימייל כבר רשומה במערכת' },
        { status: 400 }
      );
    }

    // יצירת טוקן הזמנה
    const invitationToken = jwt.sign(
      {
        inviterId: userId,
        partnerEmail,
        partnerName,
        partnerPhone,
        type: 'partner-invitation'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // עדכון פרטי השותף במשתמש
    user.partnerEmail = partnerEmail;
    user.partnerName = partnerName;
    user.partnerPhone = partnerPhone;
    await user.save();

    // שליחת האימייל
    const invitationLink = `${process.env.NEXTAUTH_URL}/register-with-invitation?token=${invitationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: partnerEmail,
      subject: `${user.fullName} מזמין/ה אותך לנהל יחד את החתונה!`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e91e63;">🎉 הוזמנת לנהל חתונה!</h2>
          
          <p>שלום ${partnerName || ''},</p>
          
          <p><strong>${user.fullName}</strong> הזמין/ה אותך להצטרף לניהול החתונה המשותפת שלכם!</p>
          
          <p>בלחיצה על הקישור תוכל/י:</p>
          <ul>
            <li>להירשם למערכת</li>
            <li>לנהל יחד את רשימת המוזמנים</li>
            <li>לתכנן את האירוע</li>
            <li>ועוד הרבה תכונות מועילות!</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" 
               style="background-color: #e91e63; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              הצטרף/י עכשיו
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            הקישור תקף למשך 7 ימים. אם לא תוכל/י להיכנס, בקש/י מ-${user.fullName} לשלוח הזמנה חדשה.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'ההזמנה נשלחה בהצלחה!'
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { success: false, message: 'שגיאה בשליחת ההזמנה' },
      { status: 500 }
    );
  }
} 