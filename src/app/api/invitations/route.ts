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

// Simple file-based storage (in production, use a proper database)
const INVITATIONS_FILE = path.join(process.cwd(), 'data', 'invitations.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(INVITATIONS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read invitations from file
const readInvitations = (): InvitationData[] => {
  try {
    ensureDataDir();
    if (!fs.existsSync(INVITATIONS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(INVITATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading invitations:', error);
    return [];
  }
};

// Write invitations to file
const writeInvitations = (invitations: InvitationData[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(INVITATIONS_FILE, JSON.stringify(invitations, null, 2));
  } catch (error) {
    console.error('Error writing invitations:', error);
    throw new Error('Failed to save invitation');
  }
};

// GET - Retrieve invitations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const invitations = readInvitations();
    const userInvitations = invitations.filter(inv => inv.userId === userId);

    return NextResponse.json({ 
      success: true, 
      invitations: userInvitations,
      count: userInvitations.length
    });

  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch invitations' 
    }, { status: 500 });
  }
}

// POST - Create or update invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      userId, 
      groomName, 
      brideName, 
      date, 
      time, 
      venue, 
      address, 
      message,
      backgroundColor,
      textColor,
      accentColor,
      fontFamily,
      backgroundPattern,
      templateId,
      logoStyle,
      logoLetters,
      logoFont,
      logoColor,
      logoShape,
      logoSize
    } = body;

    // Validation
    if (!userId || !groomName || !brideName || !date || !time || !venue) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const invitations = readInvitations();
    const now = new Date().toISOString();

    if (id) {
      // Update existing invitation
      const existingIndex = invitations.findIndex(inv => inv.id === id && inv.userId === userId);
      
      if (existingIndex === -1) {
        return NextResponse.json({ 
          error: 'Invitation not found' 
        }, { status: 404 });
      }

      const updatedInvitation: InvitationData = {
        ...invitations[existingIndex],
        groomName,
        brideName,
        date,
        time,
        venue,
        address,
        message,
        backgroundColor,
        textColor,
        accentColor,
        fontFamily,
        backgroundPattern,
        templateId,
        logoStyle,
        logoLetters,
        logoFont,
        logoColor,
        logoShape,
        logoSize,
        updatedAt: now,
        status: 'saved'
      };

      invitations[existingIndex] = updatedInvitation;
      writeInvitations(invitations);

      return NextResponse.json({ 
        success: true, 
        invitation: updatedInvitation,
        message: 'Invitation updated successfully'
      });

    } else {
      // Create new invitation
      const newInvitation: InvitationData = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        groomName,
        brideName,
        date,
        time,
        venue,
        address,
        message,
        backgroundColor,
        textColor,
        accentColor,
        fontFamily,
        backgroundPattern,
        templateId,
        logoStyle,
        logoLetters,
        logoFont,
        logoColor,
        logoShape,
        logoSize,
        createdAt: now,
        updatedAt: now,
        status: 'saved',
        sentCount: 0
      };

      invitations.push(newInvitation);
      writeInvitations(invitations);

      return NextResponse.json({ 
        success: true, 
        invitation: newInvitation,
        message: 'Invitation created successfully'
      });
    }

  } catch (error) {
    console.error('Error saving invitation:', error);
    return NextResponse.json({ 
      error: 'Failed to save invitation' 
    }, { status: 500 });
  }
}

// DELETE - Delete invitation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ 
        error: 'Invitation ID and User ID are required' 
      }, { status: 400 });
    }

    const invitations = readInvitations();
    const filteredInvitations = invitations.filter(
      inv => !(inv.id === id && inv.userId === userId)
    );

    if (filteredInvitations.length === invitations.length) {
      return NextResponse.json({ 
        error: 'Invitation not found' 
      }, { status: 404 });
    }

    writeInvitations(filteredInvitations);

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting invitation:', error);
    return NextResponse.json({ 
      error: 'Failed to delete invitation' 
    }, { status: 500 });
  }
} 