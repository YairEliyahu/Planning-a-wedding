import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Interface for invitation data
interface InvitationData {
  id: string;
  userId: string;
  groomName: string;
  brideName: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  message: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  backgroundPattern: string;
  templateId: string;
  logoStyle: string;
  logoLetters: string;
  logoFont: string;
  logoColor: string;
  logoShape: string;
  logoSize: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'saved' | 'sent';
  sentCount: number;
  lastSentAt?: string;
}

// Interface for guest data
interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  status: 'pending' | 'sent' | 'opened' | 'confirmed' | 'declined';
  sentAt?: string;
  openedAt?: string;
  respondedAt?: string;
}

// Interface for sending data
interface SendInvitationRequest {
  invitationId: string;
  userId: string;
  guests: Guest[];
  method: 'email' | 'sms' | 'whatsapp';
  customMessage?: string;
}

// Interface for send result
interface SendResult {
  guestId: string;
  guestName: string;
  success: boolean;
  messageId?: string;
  recipient?: string;
  error?: string;
}

// Read invitations
const readInvitations = (): InvitationData[] => {
  try {
    const invitationsFile = path.join(process.cwd(), 'data', 'invitations.json');
    if (!fs.existsSync(invitationsFile)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(invitationsFile, 'utf-8'));
  } catch (error) {
    console.error('Error reading invitations:', error);
    return [];
  }
};

// Write invitations
const writeInvitations = (invitations: InvitationData[]) => {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(dataDir, 'invitations.json'), 
      JSON.stringify(invitations, null, 2)
    );
  } catch (error) {
    console.error('Error writing invitations:', error);
    throw error;
  }
};

// Save sent invitations log
const saveSentLog = (logEntry: Record<string, any>) => {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const logFile = path.join(dataDir, 'sent-invitations.json');
    
    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    }
    
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error saving sent log:', error);
  }
};

// Mock email sending function (replace with real service like SendGrid, Mailgun, etc.)
const sendEmail = async (to: string, subject: string, htmlContent: string): Promise<{ success: boolean; messageId: string }> => {
  // Simulate email sending
  console.log(`📧 Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  
  // Here you would integrate with a real email service
  // Example: SendGrid, Mailgun, AWS SES, etc.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, messageId: `email_${Date.now()}` });
    }, 1000);
  });
};

// Mock SMS sending function (replace with real service like Twilio)
const sendSMS = async (to: string, message: string): Promise<{ success: boolean; messageId: string }> => {
  console.log(`📱 Sending SMS to: ${to}`);
  console.log(`Message: ${message}`);
  
  // Here you would integrate with SMS service like Twilio
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, messageId: `sms_${Date.now()}` });
    }, 800);
  });
};

// Mock WhatsApp sending function (replace with WhatsApp Business API)
const sendWhatsApp = async (to: string, message: string): Promise<{ success: boolean; messageId: string }> => {
  console.log(`💬 Sending WhatsApp to: ${to}`);
  console.log(`Message: ${message}`);
  
  // Here you would integrate with WhatsApp Business API
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, messageId: `whatsapp_${Date.now()}` });
    }, 1200);
  });
};

// Generate invitation URL
const generateInvitationUrl = (invitationId: string, guestId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/invitation/${invitationId}?guest=${guestId}`;
};

// Generate email HTML template
const generateEmailHTML = (invitation: InvitationData, guest: Guest, invitationUrl: string, customMessage?: string) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>הזמנה לחתונה - ${invitation.brideName} ו${invitation.groomName}</title>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f7f7f7; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 15px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #ff6b9d, #ffa8cc); 
          color: white; 
          padding: 30px; 
          text-align: center; 
        }
        .content { 
          padding: 30px; 
        }
        .invitation-preview {
          background: ${invitation.backgroundColor};
          color: ${invitation.textColor};
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          text-align: center;
          border: 2px solid ${invitation.accentColor};
        }
        .cta-button { 
          display: inline-block; 
          background: #ff6b9d; 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 25px; 
          font-weight: bold; 
          margin: 20px 0;
          transition: all 0.3s ease;
        }
        .cta-button:hover { 
          background: #ff4785; 
          transform: translateY(-2px);
        }
        .footer { 
          background: #f0f0f0; 
          padding: 20px; 
          text-align: center; 
          font-size: 0.9em; 
          color: #666; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎊 הזמנה מיוחדת לחתונה! 🎊</h1>
          <p>אתם מוזמנים לחגוג איתנו</p>
        </div>
        
        <div class="content">
          <p>שלום ${guest.name},</p>
          
          ${customMessage ? `<p style="background: #f0f8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b9d;">${customMessage}</p>` : ''}
          
          <p>בשמחה רבה אנו מזמינים אותך לחגוג איתנו את יום החתונה שלנו!</p>
          
          <div class="invitation-preview">
            <h2 style="color: ${invitation.accentColor}; margin-bottom: 15px;">
              ${invitation.brideName} ♡ ${invitation.groomName}
            </h2>
            <p><strong>📅 תאריך:</strong> ${invitation.date}</p>
            <p><strong>🕒 שעה:</strong> ${invitation.time}</p>
            <p><strong>📍 מקום:</strong> ${invitation.venue}</p>
            <p><strong>🗺️ כתובת:</strong> ${invitation.address}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${invitationUrl}" class="cta-button">
              📋 צפו בהזמנה המלאה ואשרו הגעה
            </a>
          </div>
          
          <p style="margin-top: 30px;">נשמח לראות אתכם חוגגים איתנו ביום המיוחד הזה!</p>
          
          <p style="font-weight: bold;">בתודה ובהכרת הטוב,<br>
          ${invitation.brideName} ו${invitation.groomName} 💕</p>
        </div>
        
        <div class="footer">
          <p>הזמנה זו נשלחה דרך מערכת ההזמנות הדיגיטלית שלנו</p>
          <p>אם אינכם יכולים לראות את ההזמנה כראוי, <a href="${invitationUrl}">לחצו כאן</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate SMS/WhatsApp message
const generateTextMessage = (invitation: InvitationData, guest: Guest, invitationUrl: string, customMessage?: string) => {
  const baseMessage = `🎊 הזמנה לחתונה! 🎊

שלום ${guest.name},

${customMessage ? customMessage + '\n\n' : ''}${invitation.brideName} ו${invitation.groomName} מתחתנים!

📅 ${invitation.date} בשעה ${invitation.time}
📍 ${invitation.venue}

צפו בהזמנה המלאה ואשרו הגעה:
${invitationUrl}

נשמח לראות אתכם! 💕`;

  return baseMessage;
};

// POST - Send invitations
export async function POST(request: NextRequest) {
  try {
    const body: SendInvitationRequest = await request.json();
    const { invitationId, userId, guests, method, customMessage } = body;

    if (!invitationId || !userId || !guests || guests.length === 0) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Find the invitation
    const invitations = readInvitations();
    const invitation = invitations.find((inv: InvitationData) => inv.id === invitationId && inv.userId === userId);

    if (!invitation) {
      return NextResponse.json({
        error: 'Invitation not found'
      }, { status: 404 });
    }

    const results: SendResult[] = [];
    const now = new Date().toISOString();

    // Send to each guest
    for (const guest of guests) {
      try {
        const invitationUrl = generateInvitationUrl(invitationId, guest.id);
        let result: SendResult = { guestId: guest.id, guestName: guest.name, success: false };

        if (method === 'email' && guest.email) {
          const subject = `🎊 הזמנה לחתונה - ${invitation.brideName} ו${invitation.groomName}`;
          const htmlContent = generateEmailHTML(invitation, guest, invitationUrl, customMessage);
          
          const emailResult = await sendEmail(guest.email, subject, htmlContent);
          result = { ...result, ...emailResult, recipient: guest.email };
          
        } else if (method === 'sms' && guest.phone) {
          const message = generateTextMessage(invitation, guest, invitationUrl, customMessage);
          
          const smsResult = await sendSMS(guest.phone, message);
          result = { ...result, ...smsResult, recipient: guest.phone };
          
        } else if (method === 'whatsapp' && guest.whatsapp) {
          const message = generateTextMessage(invitation, guest, invitationUrl, customMessage);
          
          const whatsappResult = await sendWhatsApp(guest.whatsapp, message);
          result = { ...result, ...whatsappResult, recipient: guest.whatsapp };
          
        } else {
          result.error = `No ${method} address for guest`;
        }

        results.push(result);

      } catch (error) {
        console.error(`Error sending to guest ${guest.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          guestId: guest.id,
          guestName: guest.name,
          success: false,
          error: errorMessage
        });
      }
    }

    // Update invitation statistics
    const successfulSends = results.filter(r => r.success).length;
    if (successfulSends > 0) {
      invitation.sentCount = (invitation.sentCount || 0) + successfulSends;
      invitation.lastSentAt = now;
      invitation.status = 'sent';
      
      // Update invitations file
      const invitationIndex = invitations.findIndex((inv: InvitationData) => inv.id === invitationId);
      invitations[invitationIndex] = invitation;
      writeInvitations(invitations);
    }

    // Log the send operation
    saveSentLog({
      invitationId,
      userId,
      method,
      timestamp: now,
      totalGuests: guests.length,
      successfulSends,
      results
    });

    return NextResponse.json({
      success: true,
      message: 'Invitations sent successfully',
      totalSent: successfulSends,
      totalGuests: guests.length,
      results
    });

  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json({
      error: 'Failed to send invitations'
    }, { status: 500 });
  }
}

// GET - Get sending history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('invitationId');
    const userId = searchParams.get('userId');

    if (!invitationId || !userId) {
      return NextResponse.json({
        error: 'Invitation ID and User ID are required'
      }, { status: 400 });
    }

    const logFile = path.join(process.cwd(), 'data', 'sent-invitations.json');
    let history = [];

    if (fs.existsSync(logFile)) {
      const logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
      history = logs.filter((log: Record<string, any>) => log.invitationId === invitationId && log.userId === userId);
    }

    return NextResponse.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('Error fetching send history:', error);
    return NextResponse.json({
      error: 'Failed to fetch send history'
    }, { status: 500 });
  }
} 