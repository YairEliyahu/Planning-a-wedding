// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    // בדיקות תקינות הקלט
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'יש למלא את כל השדות הנדרשים' },
        { status: 400 }
      );
    }

    // הגדרת שרת SMTP לשליחת מיילים
    // זה דוגמה עם Gmail - תצטרך להשתמש בשירות דואר אלקטרוני אמיתי בסביבת הייצור
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // תוכן המייל
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, // כתובת המייל שאליה יישלחו ההודעות
      subject: `הודעה חדשה מהאתר: ${name}`,
      replyTo: email,
      text: `
        שם: ${name}
        אימייל: ${email}
        טלפון: ${phone || 'לא צוין'}
        
        הודעה:
        ${message}
      `,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>הודעה חדשה מהאתר</h2>
          <p><strong>שם:</strong> ${name}</p>
          <p><strong>אימייל:</strong> ${email}</p>
          <p><strong>טלפון:</strong> ${phone || 'לא צוין'}</p>
          <p><strong>הודעה:</strong></p>
          <p style="white-space: pre-line;">${message}</p>
        </div>
      `,
    };

    // שליחת המייל
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'ההודעה נשלחה בהצלחה' },
      { status: 200 }
    );
  } catch (error) {
    console.error('שגיאה בשליחת המייל:', error);
    return NextResponse.json(
      { error: 'אירעה שגיאה בשליחת ההודעה' },
      { status: 500 }
    );
  }
}