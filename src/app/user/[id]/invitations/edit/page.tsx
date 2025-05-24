'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useParams, useRouter } from 'next/navigation';

interface InvitationData {
  id?: string;
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
  status?: 'draft' | 'saved' | 'sent';
  sentCount?: number;
  lastSentAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

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

interface Template {
  id: string;
  name: string;
  style: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  backgroundPattern: string;
}

const modernTemplates: Template[] = [
  {
    id: 'pearl-paper',
    name: 'נייר פנינה מתוחכם',
    style: 'pearl-paper',
    backgroundColor: 'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.8) 2px, transparent 3px), radial-gradient(circle at 75% 70%, rgba(248,250,252,0.6) 1px, transparent 2px), linear-gradient(135deg, #fefefe 0%, #f8fafc 50%, #f1f5f9 100%)',
    textColor: '#1f2937',
    accentColor: '#d4af37',
    fontFamily: 'Playfair Display',
    backgroundPattern: 'pearl-shimmer'
  },
  {
    id: 'vintage-parchment',
    name: 'קלף עתיק מעושן',
    style: 'vintage-parchment',
    backgroundColor: 'radial-gradient(ellipse at 20% 80%, rgba(139,69,19,0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(160,82,45,0.08) 0%, transparent 50%), linear-gradient(135deg, #faf5e6 0%, #f4e4bc 30%, #ede0c8 100%)',
    textColor: '#8b4513',
    accentColor: '#cd853f',
    fontFamily: 'Crimson Text',
    backgroundPattern: 'vintage-stains'
  },
  {
    id: 'marble-elegance',
    name: 'שיש אלגנטי זהוב',
    style: 'marble-elegance',
    backgroundColor: 'linear-gradient(110deg, transparent 30%, rgba(212,175,55,0.1) 35%, rgba(212,175,55,0.2) 40%, transparent 45%), linear-gradient(135deg, #ffffff 0%, #f8fafc 20%, #f1f5f9 40%, #e2e8f0 100%)',
    textColor: '#374151',
    accentColor: '#d4af37',
    fontFamily: 'Cormorant Garamond',
    backgroundPattern: 'marble-veins'
  },
  {
    id: 'linen-natural',
    name: 'פשתן טבעי מחוספס',
    style: 'linen-natural',
    backgroundColor: 'repeating-linear-gradient(0deg, rgba(101,163,13,0.03), rgba(101,163,13,0.03) 1px, transparent 1px, transparent 4px), linear-gradient(135deg, #fefcf7 0%, #f9f7f4 50%, #f5f3f0 100%)',
    textColor: '#365314',
    accentColor: '#65a30d',
    fontFamily: 'Inter',
    backgroundPattern: 'linen-weave'
  },
  {
    id: 'watercolor-soft',
    name: 'צבעי מים רכים',
    style: 'watercolor-soft',
    backgroundColor: 'radial-gradient(ellipse at 30% 70%, rgba(244,63,94,0.15) 0%, transparent 40%), radial-gradient(ellipse at 70% 30%, rgba(59,130,246,0.12) 0%, transparent 45%), linear-gradient(135deg, #fefefe 0%, #fdf4ff 25%, #fef3f2 50%, #ffffff 100%)',
    textColor: '#7c2d12',
    accentColor: '#f97316',
    fontFamily: 'Dancing Script',
    backgroundPattern: 'watercolor-blots'
  },
  {
    id: 'canvas-artistic',
    name: 'קנבס אמנותי מחוספס',
    style: 'canvas-artistic',
    backgroundColor: 'repeating-linear-gradient(45deg, rgba(120,113,108,0.03), rgba(120,113,108,0.03) 2px, transparent 2px, transparent 6px), linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
    textColor: '#44403c',
    accentColor: '#78716c',
    fontFamily: 'Montserrat',
    backgroundPattern: 'canvas-weave'
  },
  {
    id: 'sand-paper-warm',
    name: 'נייר חול חם ומזמין',
    style: 'sand-paper-warm',
    backgroundColor: 'radial-gradient(circle at 15% 25%, rgba(245,158,11,0.08) 1px, transparent 2px), radial-gradient(circle at 85% 75%, rgba(217,119,6,0.06) 1px, transparent 2px), linear-gradient(135deg, #fffbeb 0%, #fef3c7 30%, #fde68a 70%, #fed7aa 100%)',
    textColor: '#a16207',
    accentColor: '#f59e0b',
    fontFamily: 'Libre Baskerville',
    backgroundPattern: 'sand-grains'
  },
  {
    id: 'velvet-luxury',
    name: 'קטיפה יוקרתית מובלטת',
    style: 'velvet-luxury',
    backgroundColor: 'radial-gradient(ellipse at 25% 75%, rgba(124,58,237,0.1) 0%, transparent 50%), linear-gradient(135deg, #faf7ff 0%, #f3f4f6 25%, #e5e7eb 50%, #f9fafb 100%)',
    textColor: '#581c87',
    accentColor: '#7c3aed',
    fontFamily: 'Heebo',
    backgroundPattern: 'velvet-texture'
  }
];

const colorPalettes = [
  { name: 'קלאסי', colors: ['#000000', '#ffffff', '#gray-500', '#gray-700'] },
  { name: 'רומנטי', colors: ['#ff69b4', '#ffc0cb', '#ffb6c1', '#ff1493'] },
  { name: 'זהוב', colors: ['#ffd700', '#ffb347', '#daa520', '#b8860b'] },
  { name: 'ים', colors: ['#1e90ff', '#87ceeb', '#4682b4', '#0066cc'] },
  { name: 'טבע', colors: ['#32cd32', '#9acd32', '#228b22', '#006400'] },
];

const fontOptions = [
  { name: 'עברית מודרנית - Heebo', value: 'Heebo', preview: 'שרה ♡ דוד', description: 'פונט מודרני וקריא לעברית' },
  { name: 'אלגנטי קלאסי - Playfair', value: 'Playfair Display', preview: 'Sarah ♡ David', description: 'פונט אלגנטי לכותרות' },
  { name: 'טיימס קלאסי - Crimson', value: 'Crimson Text', preview: 'שרה ♡ דוד', description: 'פונט קלאסי לקריאה נעימה' },
  { name: 'מינימליסטי - Inter', value: 'Inter', preview: 'שרה ♡ דוד', description: 'פונט נקי ומודרני' },
  { name: 'מונטסרט - Montserrat', value: 'Montserrat', preview: 'שרה ♡ דוד', description: 'פונט אוניברסלי ויפה' },
  { name: 'רומנטי - Dancing Script', value: 'Dancing Script', preview: 'Sarah ♡ David', description: 'פונט קליגרפי רומנטי' },
  { name: 'וינטג׳ - Libre Baskerville', value: 'Libre Baskerville', preview: 'שרה ♡ דוד', description: 'פונט קלאסי בהשראת וינטג׳' },
  { name: 'סריף מעודן - Cormorant', value: 'Cormorant Garamond', preview: 'שרה ♡ דוד', description: 'פונט סריף אלגנטי' }
];

const decorations = [
  { id: 'hearts', name: '💕 לבבות', icon: '💕' },
  { id: 'flowers', name: '🌸 פרחים', icon: '🌸' },
  { id: 'rings', name: '💍 טבעות', icon: '💍' },
  { id: 'stars', name: '✨ כוכבים', icon: '✨' },
  { id: 'geometric', name: '◆ גיאומטרי', icon: '◆' },
  { id: 'vintage', name: '🎭 וינטג׳', icon: '🎭' },
];

const logoStyles = [
  { 
    id: 'elegant-circle', 
    name: 'עיגול אלגנטי', 
    icon: '⭕',
    description: 'לוגו עגול מינימליסטי עם אותיות מרכזיות',
    defaultFont: 'Playfair Display',
    defaultShape: 'circle'
  },
  { 
    id: 'modern-minimal', 
    name: 'מודרני מינימל', 
    icon: '▫️',
    description: 'עיצוב נקי ומודרני עם טיפוגרפיה בולטת',
    defaultFont: 'Inter',
    defaultShape: 'rectangle'
  },
  { 
    id: 'luxury-frame', 
    name: 'מסגרת יוקרתית', 
    icon: '🖼️',
    description: 'מסגרת מעוטרת עם אותיות מרכזיות',
    defaultFont: 'Cormorant Garamond',
    defaultShape: 'frame'
  },
  { 
    id: 'classic-monogram', 
    name: 'מונוגרם קלאסי', 
    icon: '💎',
    description: 'אותיות משולבות בסגנון קלאסי מתוחכם',
    defaultFont: 'Crimson Text',
    defaultShape: 'square'
  },
  { 
    id: 'artistic-badge', 
    name: 'תג אמנותי', 
    icon: '🏷️',
    description: 'עיצוב תג עם גימור מקצועי',
    defaultFont: 'Montserrat',
    defaultShape: 'badge'
  },
  { 
    id: 'romantic-script', 
    name: 'כתב יד רומנטי', 
    icon: '💕',
    description: 'אותיות זורמות בסגנון כתב יד אלגנטי',
    defaultFont: 'Dancing Script',
    defaultShape: 'flowing'
  }
];

const logoFonts = [
  { name: 'פלייפייר אלגנטי', value: 'Playfair Display', preview: 'AB', style: 'serif' },
  { name: 'אינטר מודרני', value: 'Inter', preview: 'AB', style: 'sans-serif' },
  { name: 'קורמורנט מעודן', value: 'Cormorant Garamond', preview: 'AB', style: 'serif' },
  { name: 'קרימזון קלאסי', value: 'Crimson Text', preview: 'AB', style: 'serif' },
  { name: 'מונטסרט נקי', value: 'Montserrat', preview: 'AB', style: 'sans-serif' },
  { name: 'דאנסינג רומנטי', value: 'Dancing Script', preview: 'AB', style: 'script' },
  { name: 'ליברה וינטג׳', value: 'Libre Baskerville', preview: 'AB', style: 'serif' },
  { name: 'עברית מודרנית', value: 'Heebo', preview: 'אב', style: 'sans-serif' }
];

const logoShapes = [
  { id: 'circle', name: 'עיגול', icon: '⭕', css: 'rounded-full' },
  { id: 'square', name: 'ריבוע', icon: '⬜', css: 'rounded-lg' },
  { id: 'rectangle', name: 'מלבן', icon: '▭', css: 'rounded-md' },
  { id: 'frame', name: 'מסגרת', icon: '🖼️', css: 'border-4 rounded-lg' },
  { id: 'badge', name: 'תג', icon: '🏷️', css: 'rounded-full border-2' },
  { id: 'flowing', name: 'זורם', icon: '〰️', css: 'rounded-3xl' }
];

const logoSizes = [
  { id: 'small', name: 'קטן', value: '60px', textSize: '1.5rem' },
  { id: 'medium', name: 'בינוני', value: '80px', textSize: '2rem' },
  { id: 'large', name: 'גדול', value: '100px', textSize: '2.5rem' },
  { id: 'xlarge', name: 'ענק', value: '120px', textSize: '3rem' }
];

const logoColorPalettes = [
  { name: 'זהב יוקרתי', primary: '#d4af37', secondary: '#f7e98e', text: '#ffffff' },
  { name: 'כסף אלגנטי', primary: '#c0c0c0', secondary: '#e8e8e8', text: '#333333' },
  { name: 'רוז גולד', primary: '#e8b4b8', secondary: '#f4d2d7', text: '#ffffff' },
  { name: 'כחול מלכותי', primary: '#1e3a8a', secondary: '#3b82f6', text: '#ffffff' },
  { name: 'שחור קלאסי', primary: '#000000', secondary: '#4b5563', text: '#ffffff' },
  { name: 'אפור מודרני', primary: '#6b7280', secondary: '#d1d5db', text: '#ffffff' },
  { name: 'ירוק טבעי', primary: '#059669', secondary: '#a7f3d0', text: '#ffffff' },
  { name: 'סגול מלכותי', primary: '#7c3aed', secondary: '#c4b5fd', text: '#ffffff' }
];

const LogoComponent = ({ letters, logoFont, logoColor, logoShape, logoSize, logoStyle }: {
  letters: string;
  logoFont: string;
  logoColor: string;
  logoShape: string;
  logoSize: string;
  logoStyle: string;
}) => {
  if (!letters) return <span className="text-gray-400 text-sm">הכניסו אותיות</span>;
  
  const selectedSize = logoSizes.find(size => size.id === logoSize) || logoSizes[1];
  const selectedShape = logoShapes.find(shape => shape.id === logoShape) || logoShapes[0];
  const selectedColorPalette = logoColorPalettes.find(palette => palette.primary === logoColor) || logoColorPalettes[0];
  
  // Map font names to CSS variable names
  const fontMap: { [key: string]: string } = {
    'Inter': 'var(--font-inter)',
    'Playfair Display': 'var(--font-playfair-display)',
    'Crimson Text': 'var(--font-crimson-text)',
    'Montserrat': 'var(--font-montserrat)',
    'Dancing Script': 'var(--font-dancing-script)',
    'Libre Baskerville': 'var(--font-libre-baskerville)',
    'Cormorant Garamond': 'var(--font-cormorant-garamond)',
    'Heebo': 'var(--font-heebo)'
  };
  
  const logoContainerStyle: React.CSSProperties = {
    width: selectedSize.value,
    height: selectedSize.value,
    backgroundColor: selectedColorPalette.primary,
    color: selectedColorPalette.text,
    fontFamily: fontMap[logoFont] || fontMap['Playfair Display'],
    fontSize: selectedSize.textSize,
    fontWeight: logoStyle === 'modern-minimal' ? '300' : logoStyle === 'artistic-badge' ? '600' : 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: selectedShape.id === 'frame' ? `4px solid ${selectedColorPalette.secondary}` : 
           selectedShape.id === 'badge' ? `2px solid ${selectedColorPalette.secondary}` : 'none',
    borderRadius: selectedShape.id === 'circle' || selectedShape.id === 'badge' ? '50%' :
                 selectedShape.id === 'flowing' ? '3rem' :
                 selectedShape.id === 'square' ? '0.5rem' : '0.375rem',
    boxShadow: logoStyle === 'luxury-frame' ? '0 4px 12px rgba(0,0,0,0.15)' : 
               logoStyle === 'artistic-badge' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
    letterSpacing: logoStyle === 'modern-minimal' ? '0.1em' : 
                   logoStyle === 'romantic-script' ? '0.05em' : 'normal',
    textTransform: logoStyle === 'romantic-script' ? 'none' : 'uppercase',
    position: 'relative'
  };
  
  return (
    <div style={logoContainerStyle}>
      {letters}
      {/* Add subtle gradient overlay for luxury feel */}
      {logoStyle === 'luxury-frame' && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
            borderRadius: 'inherit',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
};

export default function InvitationEditor() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const templateId = searchParams?.get('template') || 'pearl-paper';
  const invitationId = searchParams?.get('invitationId');
  const userId = params?.id as string;
  
  const [activePanel, setActivePanel] = useState<'text' | 'colors' | 'fonts' | 'decorations' | 'logos' | 'send'>('text');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendMethod, setSendMethod] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [customMessage, setCustomMessage] = useState('');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  
  const [invitation, setInvitation] = useState<InvitationData>({
    groomName: 'דוד',
    brideName: 'שרה',
    date: '15.8.2024',
    time: '19:00',
    venue: 'גני אירועים חלומות',
    address: 'רח׳ הפרחים 123, תל אביב',
    message: 'בשמחה רבה אנו מזמינים אתכם לחגוג איתנו את יום החתונה שלנו',
    backgroundColor: modernTemplates.find(t => t.id === templateId)?.backgroundColor || modernTemplates[0].backgroundColor,
    textColor: modernTemplates.find(t => t.id === templateId)?.textColor || modernTemplates[0].textColor,
    accentColor: modernTemplates.find(t => t.id === templateId)?.accentColor || modernTemplates[0].accentColor,
    fontFamily: modernTemplates.find(t => t.id === templateId)?.fontFamily || modernTemplates[0].fontFamily,
    backgroundPattern: modernTemplates.find(t => t.id === templateId)?.backgroundPattern || '',
    templateId: templateId,
    logoStyle: logoStyles[0].id,
    logoLetters: 'AB',
    logoFont: logoFonts[0].value,
    logoColor: logoColorPalettes[0].primary,
    logoShape: logoShapes[0].id,
    logoSize: logoSizes[1].id
  });

  // Load existing invitation on component mount
  useEffect(() => {
    if (invitationId && userId) {
      loadInvitation();
    }
  }, [invitationId, userId]);

  const loadInvitation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invitations?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const foundInvitation = data.invitations.find((inv: InvitationData) => inv.id === invitationId);
        
        if (foundInvitation) {
          setInvitation(foundInvitation);
        }
      }
    } catch (error) {
      console.error('Error loading invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateInvitation = (field: keyof InvitationData, value: string) => {
    setInvitation(prev => ({ ...prev, [field]: value }));
    // Auto-save indication
    setSaveStatus('saving');
    
    // Debounced auto-save
    setTimeout(() => {
      handleAutoSave();
    }, 2000);
  };

  const handleAutoSave = async () => {
    try {
      await saveInvitation();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const saveInvitation = async () => {
    const response = await fetch('/api/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...invitation,
        userId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save invitation');
    }

    const data = await response.json();
    
    // Update invitation with server response (including ID for new invitations)
    if (data.invitation && !invitation.id) {
      setInvitation(prev => ({ ...prev, id: data.invitation.id }));
      
      // Update URL to include invitation ID
      const newUrl = `/user/${userId}/invitations/edit?template=${templateId}&invitationId=${data.invitation.id}`;
      router.replace(newUrl);
    }

    return data;
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await saveInvitation();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSendInvitations = async () => {
    if (!invitation.id || guests.length === 0) {
      alert('אנא שמרו את ההזמנה והוסיפו אורחים לפני השליחה');
      return;
    }

    setSendStatus('sending');
    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId: invitation.id,
          userId,
          guests,
          method: sendMethod,
          customMessage: customMessage || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSendStatus('sent');
        alert(`נשלחו בהצלחה ${data.totalSent} הזמנות מתוך ${data.totalGuests}`);
        setShowSendModal(false);
        
        // Refresh invitation data to get updated sent count
        loadInvitation();
      } else {
        throw new Error('Failed to send invitations');
      }
    } catch (error) {
      setSendStatus('error');
      alert('שגיאה בשליחת ההזמנות. אנא נסו שוב.');
    } finally {
      setTimeout(() => setSendStatus('idle'), 3000);
    }
  };

  const addGuest = () => {
    const newGuest: Guest = {
      id: `guest_${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      status: 'pending'
    };
    setGuests(prev => [...prev, newGuest]);
  };

  const updateGuest = (guestId: string, field: keyof Guest, value: string) => {
    setGuests(prev => prev.map(guest => 
      guest.id === guestId ? { ...guest, [field]: value } : guest
    ));
  };

  const removeGuest = (guestId: string) => {
    setGuests(prev => prev.filter(guest => guest.id !== guestId));
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return '💾 שומר...';
      case 'saved': return '✅ נשמר!';
      case 'error': return '❌ שגיאה';
      default: return '💾 שמור הזמנה';
    }
  };

  const getSaveButtonClass = () => {
    const baseClass = 'w-full py-3 rounded-md font-medium transition-all duration-300 font-[var(--font-heebo)]';
    switch (saveStatus) {
      case 'saving': return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`;
      case 'saved': return `${baseClass} bg-green-500 text-white`;
      case 'error': return `${baseClass} bg-red-500 text-white`;
      default: return `${baseClass} bg-pink-500 text-white hover:bg-pink-600`;
    }
  };

  const generateBackgroundPattern = (pattern: string) => {
    switch (pattern) {
      case 'pearl-shimmer':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Ccircle cx=\'15\' cy=\'15\' r=\'1.5\' fill=\'rgba(255,255,255,0.6)\' opacity=\'0.8\'/%3E%3Ccircle cx=\'8\' cy=\'8\' r=\'1\' fill=\'rgba(248,250,252,0.5)\'/%3E%3Ccircle cx=\'22\' cy=\'22\' r=\'0.8\' fill=\'rgba(241,245,249,0.4)\'/%3E%3C/svg%3E")';
      case 'vintage-stains':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\' viewBox=\'0 0 120 120\'%3E%3Cellipse cx=\'30\' cy=\'80\' rx=\'15\' ry=\'10\' fill=\'rgba(139,69,19,0.08)\' opacity=\'0.6\'/%3E%3Cellipse cx=\'90\' cy=\'40\' rx=\'12\' ry=\'8\' fill=\'rgba(160,82,45,0.06)\' opacity=\'0.5\'/%3E%3Cellipse cx=\'60\' cy=\'60\' rx=\'8\' ry=\'6\' fill=\'rgba(205,133,63,0.04)\' opacity=\'0.4\'/%3E%3C/svg%3E")';
      case 'marble-veins':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 200 200\'%3E%3Cpath d=\'M0,50 Q50,30 100,50 T200,50\' stroke=\'rgba(212,175,55,0.15)\' stroke-width=\'2\' fill=\'none\' opacity=\'0.7\'/%3E%3Cpath d=\'M0,120 Q80,100 160,120 T200,120\' stroke=\'rgba(184,134,11,0.12)\' stroke-width=\'1.5\' fill=\'none\' opacity=\'0.6\'/%3E%3C/svg%3E")';
      case 'linen-weave':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' viewBox=\'0 0 8 8\'%3E%3Cline x1=\'0\' y1=\'0\' x2=\'8\' y2=\'0\' stroke=\'rgba(101,163,13,0.04)\' stroke-width=\'0.5\'/%3E%3Cline x1=\'0\' y1=\'4\' x2=\'8\' y2=\'4\' stroke=\'rgba(101,163,13,0.03)\' stroke-width=\'0.5\'/%3E%3Cline x1=\'0\' y1=\'0\' x2=\'0\' y2=\'8\' stroke=\'rgba(101,163,13,0.04)\' stroke-width=\'0.5\'/%3E%3Cline x1=\'4\' y1=\'0\' x2=\'4\' y2=\'8\' stroke=\'rgba(101,163,13,0.03)\' stroke-width=\'0.5\'/%3E%3C/svg%3E")';
      case 'watercolor-blots':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\' viewBox=\'0 0 150 150\'%3E%3Cellipse cx=\'40\' cy=\'100\' rx=\'20\' ry=\'15\' fill=\'rgba(244,63,94,0.08)\' opacity=\'0.6\'/%3E%3Cellipse cx=\'110\' cy=\'50\' rx=\'18\' ry=\'12\' fill=\'rgba(59,130,246,0.06)\' opacity=\'0.5\'/%3E%3Cellipse cx=\'30\' cy=\'30\' rx=\'12\' ry=\'10\' fill=\'rgba(168,85,247,0.04)\' opacity=\'0.4\'/%3E%3C/svg%3E")';
      case 'canvas-weave':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 10 10\'%3E%3Crect x=\'0\' y=\'0\' width=\'5\' height=\'5\' fill=\'rgba(120,113,108,0.02)\' opacity=\'0.8\'/%3E%3Crect x=\'5\' y=\'5\' width=\'5\' height=\'5\' fill=\'rgba(120,113,108,0.02)\' opacity=\'0.8\'/%3E%3Crect x=\'0\' y=\'5\' width=\'5\' height=\'5\' fill=\'rgba(87,83,78,0.01)\' opacity=\'0.6\'/%3E%3Crect x=\'5\' y=\'0\' width=\'5\' height=\'5\' fill=\'rgba(87,83,78,0.01)\' opacity=\'0.6\'/%3E%3C/svg%3E")';
      case 'sand-grains':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'25\' height=\'25\' viewBox=\'0 0 25 25\'%3E%3Ccircle cx=\'6\' cy=\'8\' r=\'0.8\' fill=\'rgba(245,158,11,0.06)\' opacity=\'0.8\'/%3E%3Ccircle cx=\'18\' cy=\'18\' r=\'0.6\' fill=\'rgba(217,119,6,0.05)\' opacity=\'0.7\'/%3E%3Ccircle cx=\'12\' cy=\'20\' r=\'0.5\' fill=\'rgba(251,191,36,0.04)\' opacity=\'0.6\'/%3E%3Ccircle cx=\'20\' cy=\'10\' r=\'0.7\' fill=\'rgba(202,138,4,0.04)\' opacity=\'0.5\'/%3E%3C/svg%3E")';
      case 'velvet-texture':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'6\' height=\'6\' viewBox=\'0 0 6 6\'%3E%3Crect x=\'0\' y=\'0\' width=\'2\' height=\'2\' fill=\'rgba(124,58,237,0.02)\' opacity=\'0.8\'/%3E%3Crect x=\'2\' y=\'2\' width=\'2\' height=\'2\' fill=\'rgba(99,102,241,0.02)\' opacity=\'0.7\'/%3E%3Crect x=\'4\' y=\'4\' width=\'2\' height=\'2\' fill=\'rgba(124,58,237,0.02)\' opacity=\'0.6\'/%3E%3C/svg%3E")';
      case 'hearts':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Ctext x=\'10\' y=\'15\' text-anchor=\'middle\' font-size=\'12\' fill=\'rgba(255,255,255,0.1)\'%3E♡%3C/text%3E%3C/svg%3E")';
      case 'geometric':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'%3E%3Cpolygon points=\'20,5 35,35 5,35\' fill=\'none\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'1\'/%3E%3C/svg%3E")';
      case 'floral':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Ctext x=\'15\' y=\'20\' text-anchor=\'middle\' font-size=\'16\' fill=\'rgba(255,255,255,0.1)\'%3E🌸%3C/text%3E%3C/svg%3E")';
      default:
        return 'none';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Tools Panel */}
      <div className="w-80 bg-white shadow-lg border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 font-[var(--font-heebo)]">עורך ההזמנות</h2>
          <p className="text-sm text-gray-600 font-[var(--font-heebo)]">עצבו את ההזמנה המושלמת</p>
        </div>

        {/* Tool Tabs */}
        <div className="flex border-b">
          {[
            { id: 'text', label: 'טקסט', icon: '📝' },
            { id: 'colors', label: 'צבעים', icon: '🎨' },
            { id: 'fonts', label: 'פונטים', icon: '✍️' },
            { id: 'decorations', label: 'עיטורים', icon: '✨' },
            { id: 'logos', label: 'לוגו', icon: '🎯' },
            { id: 'send', label: 'שליחה', icon: '📤' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id as 'text' | 'colors' | 'fonts' | 'decorations' | 'logos' | 'send')}
              className={`flex-1 p-3 text-sm font-medium transition-colors font-[var(--font-heebo)] ${
                activePanel === tab.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div>{tab.icon}</div>
              <div>{tab.label}</div>
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {activePanel === 'text' && (
              <motion.div
                key="text-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="groomName" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">שם החתן</label>
                  <input
                    id="groomName"
                    type="text"
                    value={invitation.groomName}
                    onChange={(e) => updateInvitation('groomName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]"
                  />
                </div>
                <div>
                  <label htmlFor="brideName" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">שם הכלה</label>
                  <input
                    id="brideName"
                    type="text"
                    value={invitation.brideName}
                    onChange={(e) => updateInvitation('brideName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]"
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">תאריך</label>
                  <input
                    id="date"
                    type="text"
                    value={invitation.date}
                    onChange={(e) => updateInvitation('date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]"
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">שעה</label>
                  <input
                    id="time"
                    type="text"
                    value={invitation.time}
                    onChange={(e) => updateInvitation('time', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]"
                  />
                </div>
                <div>
                  <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">מקום האירוע</label>
                  <input
                    id="venue"
                    type="text"
                    value={invitation.venue}
                    onChange={(e) => updateInvitation('venue', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">כתובת</label>
                  <input
                    id="address"
                    type="text"
                    value={invitation.address}
                    onChange={(e) => updateInvitation('address', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">הודעה אישית</label>
                  <textarea
                    id="message"
                    value={invitation.message}
                    onChange={(e) => updateInvitation('message', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]"
                  />
                </div>
              </motion.div>
            )}

            {activePanel === 'colors' && (
              <motion.div
                key="colors-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-medium text-gray-800 mb-3 font-[var(--font-heebo)]">צבע רקע</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {modernTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => updateInvitation('backgroundColor', template.backgroundColor)}
                        className={`h-12 rounded-md border-2 ${
                          invitation.backgroundColor === template.backgroundColor ? 'border-pink-500' : 'border-gray-300'
                        }`}
                        style={{ background: template.backgroundColor }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-3 font-[var(--font-heebo)]">פלטות צבעים</h3>
                  {colorPalettes.map((palette) => (
                    <div key={palette.name} className="mb-3">
                      <div className="text-sm text-gray-600 mb-1 font-[var(--font-heebo)]">{palette.name}</div>
                      <div className="flex gap-1">
                        {palette.colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => updateInvitation('textColor', color)}
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activePanel === 'fonts' && (
              <motion.div
                key="fonts-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {fontOptions.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => updateInvitation('fontFamily', font.value)}
                    className={`w-full p-3 text-right border rounded-md transition-colors ${
                      invitation.fontFamily === font.value
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-[var(--font-heebo)] text-sm text-gray-600 mb-1">{font.name}</div>
                    <div className="font-[var(--font-heebo)] text-xs text-gray-500 mb-2">{font.description}</div>
                    <div className={`text-lg font-[var(--font-${font.value.toLowerCase()})]`}>
                      {font.preview}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {activePanel === 'decorations' && (
              <motion.div
                key="decorations-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  {decorations.map((decoration) => (
                    <button
                      key={decoration.id}
                      onClick={() => updateInvitation('backgroundPattern', decoration.id)}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        invitation.backgroundPattern === decoration.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">{decoration.icon}</div>
                      <div className="text-sm font-[var(--font-heebo)]">{decoration.name}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activePanel === 'logos' && (
              <motion.div
                key="logos-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <div className="text-lg font-bold text-gray-800 font-[var(--font-heebo)]">
                    יוצר לוגו מותאם אישית
                  </div>
                  <div className="mt-3 bg-gray-50 rounded-lg p-4">
                    <LogoComponent 
                      letters={invitation.logoLetters || 'AB'} 
                      logoFont={invitation.logoFont || logoFonts[0].value} 
                      logoColor={invitation.logoColor || logoColorPalettes[0].primary} 
                      logoShape={invitation.logoShape || logoShapes[0].id} 
                      logoSize={invitation.logoSize || logoSizes[1].id} 
                      logoStyle={invitation.logoStyle} 
                    />
                  </div>
                </div>
                
                {/* Letters Input */}
                <div>
                  <label htmlFor="logoLetters" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                    אותיות הלוגו
                  </label>
                  <input
                    id="logoLetters"
                    type="text"
                    maxLength={4}
                    value={invitation.logoLetters}
                    onChange={(e) => updateInvitation('logoLetters', e.target.value)}
                    placeholder="למשל: AB או אב"
                    className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)] text-center text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-[var(--font-heebo)]">עד 4 אותיות</p>
                </div>

                {/* Logo Style */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">סגנון לוגו</div>
                  <div className="grid grid-cols-1 gap-2">
                    {logoStyles.map((logo) => (
                      <button
                        key={logo.id}
                        onClick={() => {
                          updateInvitation('logoStyle', logo.id);
                          updateInvitation('logoFont', logo.defaultFont);
                          updateInvitation('logoShape', logo.defaultShape);
                        }}
                        className={`p-3 border rounded-lg text-right transition-colors ${
                          invitation.logoStyle === logo.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{logo.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 font-[var(--font-heebo)]">{logo.name}</div>
                            <div className="text-sm text-gray-600 font-[var(--font-heebo)]">{logo.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Font */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">פונט לוגו</div>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {logoFonts.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => updateInvitation('logoFont', font.value)}
                        className={`p-2 border rounded-md text-right transition-colors ${
                          invitation.logoFont === font.value
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-[var(--font-heebo)]">{font.name}</span>
                          <span className={`font-[var(--font-${font.value.toLowerCase()})] text-lg`}>
                            {font.preview}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Colors */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">צבע לוגו</div>
                  <div className="grid grid-cols-2 gap-2">
                    {logoColorPalettes.map((colorPalette) => (
                      <button
                        key={colorPalette.primary}
                        onClick={() => updateInvitation('logoColor', colorPalette.primary)}
                        className={`p-3 border rounded-lg transition-colors ${
                          invitation.logoColor === colorPalette.primary
                            ? 'border-pink-500 ring-2 ring-pink-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: colorPalette.primary }}
                          />
                          <span className="text-sm font-[var(--font-heebo)]">{colorPalette.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Shape */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">צורת לוגו</div>
                  <div className="grid grid-cols-3 gap-2">
                    {logoShapes.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => updateInvitation('logoShape', shape.id)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          invitation.logoShape === shape.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-lg mb-1">{shape.icon}</div>
                        <div className="text-xs font-[var(--font-heebo)]">{shape.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Size */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">גודל לוגו</div>
                  <div className="grid grid-cols-2 gap-2">
                    {logoSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => updateInvitation('logoSize', size.id)}
                        className={`p-2 border rounded-lg text-center transition-colors ${
                          invitation.logoSize === size.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-sm font-[var(--font-heebo)]">{size.name}</div>
                        <div className="text-xs text-gray-500">{size.value}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activePanel === 'send' && (
              <motion.div
                key="send-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Invitation Status */}
                {invitation.status && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 font-[var(--font-heebo)]">
                      סטטוס ההזמנה: {invitation.status === 'sent' ? 'נשלחה' : invitation.status === 'saved' ? 'נשמרה' : 'טיוטה'}
                    </div>
                    {invitation.sentCount && (
                      <div className="text-xs text-blue-600 font-[var(--font-heebo)]">
                        נשלחה ל-{invitation.sentCount} אורחים
                      </div>
                    )}
                  </div>
                )}

                {/* Guest Management */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-800 font-[var(--font-heebo)]">רשימת אורחים</h3>
                    <button
                      onClick={addGuest}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors font-[var(--font-heebo)]"
                    >
                      + הוסף אורח
                    </button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {guests.map((guest) => (
                      <div key={guest.id} className="border border-gray-300 rounded-lg p-3 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <input
                            type="text"
                            placeholder="שם האורח"
                            value={guest.name}
                            onChange={(e) => updateGuest(guest.id, 'name', e.target.value)}
                            className="flex-1 p-1 border border-gray-200 rounded text-sm font-[var(--font-heebo)]"
                          />
                          <button
                            onClick={() => removeGuest(guest.id)}
                            className="ml-2 text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="space-y-1">
                          {sendMethod === 'email' && (
                            <input
                              type="email"
                              placeholder="אימייל"
                              value={guest.email || ''}
                              onChange={(e) => updateGuest(guest.id, 'email', e.target.value)}
                              className="w-full p-1 border border-gray-200 rounded text-sm font-[var(--font-heebo)]"
                            />
                          )}
                          
                          {sendMethod === 'sms' && (
                            <input
                              type="tel"
                              placeholder="מספר טלפון"
                              value={guest.phone || ''}
                              onChange={(e) => updateGuest(guest.id, 'phone', e.target.value)}
                              className="w-full p-1 border border-gray-200 rounded text-sm font-[var(--font-heebo)]"
                            />
                          )}
                          
                          {sendMethod === 'whatsapp' && (
                            <input
                              type="tel"
                              placeholder="וואטסאפ"
                              value={guest.whatsapp || ''}
                              onChange={(e) => updateGuest(guest.id, 'whatsapp', e.target.value)}
                              className="w-full p-1 border border-gray-200 rounded text-sm font-[var(--font-heebo)]"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {guests.length === 0 && (
                      <div className="text-center text-gray-500 py-4 font-[var(--font-heebo)]">
                        לא נוספו אורחים עדיין
                      </div>
                    )}
                  </div>
                </div>

                {/* Send Method */}
                <div>
                  <label htmlFor="sendMethod" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">שיטת שליחה</label>
                  <select
                    id="sendMethod"
                    value={sendMethod}
                    onChange={(e) => setSendMethod(e.target.value as 'email' | 'sms' | 'whatsapp')}
                    className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]"
                  >
                    <option value="email">📧 אימייל</option>
                    <option value="sms">📱 סמס</option>
                    <option value="whatsapp">💬 וואטסאפ</option>
                  </select>
                </div>

                {/* Custom Message */}
                <div>
                  <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">הודעה אישית (אופציונלי)</label>
                  <textarea
                    id="customMessage"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                    placeholder="הוסיפו הודעה אישית להזמנה..."
                    className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]"
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendInvitations}
                  disabled={!invitation.id || guests.length === 0 || sendStatus === 'sending'}
                  className={`w-full py-3 rounded-md font-medium transition-colors font-[var(--font-heebo)] ${
                    !invitation.id || guests.length === 0 || sendStatus === 'sending'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : sendStatus === 'sent'
                      ? 'bg-green-500 text-white'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  {sendStatus === 'sending' ? '📤 שולח...' : 
                   sendStatus === 'sent' ? '✅ נשלח!' : 
                   '📤 שלח הזמנות'}
                </button>

                {guests.length === 0 && (
                  <p className="text-xs text-red-500 font-[var(--font-heebo)]">
                    הוסיפו אורחים כדי לשלוח את ההזמנה
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2">
            <button className={getSaveButtonClass()} onClick={handleSave}>
              {getSaveButtonText()}
            </button>
            
            {invitation.id && (
              <button 
                onClick={() => setShowSendModal(true)}
                className="w-full bg-green-500 text-white py-3 rounded-md font-medium hover:bg-green-600 transition-colors font-[var(--font-heebo)]"
              >
                📤 שלח הזמנות
                {invitation.sentCount && invitation.sentCount > 0 && (
                  <span className="text-xs opacity-75 block">
                    נשלחה ל-{invitation.sentCount} אורחים
                  </span>
                )}
              </button>
            )}
            
            <button className="w-full bg-blue-500 text-white py-3 rounded-md font-medium hover:bg-blue-600 transition-colors font-[var(--font-heebo)]">
              📄 ייצא כPDF
            </button>
            
            <Link 
              href="../"
              className="block w-full bg-gray-500 text-white py-3 rounded-md font-medium hover:bg-gray-600 transition-colors text-center font-[var(--font-heebo)]"
            >
              ← חזרה לתבניות
            </Link>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 font-[var(--font-heebo)]">שליחת הזמנות</h3>
            <p className="text-gray-600 mb-4 font-[var(--font-heebo)]">
              להמשך השליחה, בחרו בלשונית "שליחה" בתפריט הצדדי
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setActivePanel('send');
                }}
                className="flex-1 bg-pink-500 text-white py-2 rounded-md font-[var(--font-heebo)]"
              >
                עבור לשליחה
              </button>
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-[var(--font-heebo)]"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Preview Area */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 font-[var(--font-heebo)]">טוען הזמנה...</p>
            </div>
          </div>
        )}

        {/* Preview Controls */}
        <div className="mb-4 flex items-center gap-4">
          <div className="text-sm text-gray-600 font-[var(--font-heebo)]">תצוגה מקדימה</div>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1 text-xs bg-gray-100 rounded-md hover:bg-gray-200 transition-colors font-[var(--font-heebo)]"
              onClick={() => {
                const select = document.querySelector('select[data-template-switcher]') as HTMLSelectElement;
                if (select) select.click();
              }}
            >
              🎨 החלף תבנית
            </button>
            <select 
              data-template-switcher
              value={invitation.templateId}
              onChange={(e) => {
                const newTemplate = modernTemplates.find(t => t.id === e.target.value);
                if (newTemplate) {
                  updateInvitation('templateId', e.target.value);
                  updateInvitation('backgroundColor', newTemplate.backgroundColor);
                  updateInvitation('textColor', newTemplate.textColor);
                  updateInvitation('accentColor', newTemplate.accentColor);
                  updateInvitation('fontFamily', newTemplate.fontFamily);
                  updateInvitation('backgroundPattern', newTemplate.backgroundPattern);
                }
              }}
              className="text-xs bg-white border border-gray-300 rounded-md px-2 py-1 font-[var(--font-heebo)]"
            >
              {modernTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Save Status Indicator */}
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                שומר...
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                נשמר אוטומטית
              </div>
            )}
          </div>
        </div>

        <div className="max-w-md w-full">
          {/* Invitation Preview */}
          <motion.div
            className="aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden relative"
            style={{
              background: invitation.backgroundColor,
              backgroundImage: generateBackgroundPattern(invitation.backgroundPattern),
              backgroundSize: invitation.templateId === 'pearl-paper' ? '40px 40px, 25px 25px, 60px 60px, 100% 100%' :
                             invitation.templateId === 'vintage-parchment' ? '200px 200px, 150px 150px, 100px 100px, 100% 100%' :
                             invitation.templateId === 'linen-natural' ? '4px 4px, 4px 4px, 100% 100%' :
                             invitation.templateId === 'watercolor-soft' ? '300px 300px, 250px 250px, 200px 200px, 180px 180px, 100% 100%' :
                             invitation.templateId === 'canvas-artistic' ? '8px 8px, 12px 12px, 100% 100%' :
                             invitation.templateId === 'sand-paper-warm' ? '20px 20px, 35px 35px, 50px 50px, 25px 25px, 100% 100%' :
                             '100% 100%',
              color: invitation.textColor,
              fontFamily: `var(--font-${invitation.fontFamily.toLowerCase()}), sans-serif`
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 p-8 flex flex-col justify-center text-center">
              {/* Custom Logo */}
              <div className="mb-6">
                <div className="text-4xl font-bold mb-2" style={{ color: invitation.accentColor }}>
                  <LogoComponent 
                    letters={invitation.logoLetters} 
                    logoFont={invitation.logoFont} 
                    logoColor={invitation.logoColor} 
                    logoShape={invitation.logoShape} 
                    logoSize={invitation.logoSize} 
                    logoStyle={invitation.logoStyle} 
                  />
                </div>
              </div>

              {/* Header */}
              <div className="mb-8">
                <div className="text-3xl font-bold mb-2" style={{ color: invitation.textColor }}>
                  {invitation.brideName} ♡ {invitation.groomName}
                </div>
                <div className="text-lg opacity-90">מתחתנים!</div>
              </div>

              {/* Event Details */}
              <div className="space-y-4 mb-8">
                <div className="text-xl font-semibold">{invitation.date}</div>
                <div className="text-lg">{invitation.time}</div>
                <div className="border-t border-b py-4 opacity-90" style={{ borderColor: invitation.accentColor + '50' }}>
                  <div className="font-medium">{invitation.venue}</div>
                  <div className="text-sm mt-1">{invitation.address}</div>
                </div>
              </div>

              {/* Personal Message */}
              <div className="text-sm leading-relaxed opacity-80">
                {invitation.message}
              </div>

              {/* Decorative Element */}
              <div className="mt-6 text-2xl" style={{ color: invitation.accentColor }}>
                ✨ ♡ ✨
              </div>
            </div>
          </motion.div>

          {/* Preview Controls */}
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600 font-[var(--font-heebo)]">תצוגה מקדימה - הזמנה דיגיטלית</div>
          </div>
        </div>
      </div>
    </div>
  );
} 