'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  weddingDate: string;
  partnerName: string;
  partnerPhone: string;
  partnerEmail?: string;
  expectedGuests: string;
  budget: string;
  venueType: 'garden' | 'nature' | '';
  timeOfDay: 'evening' | 'afternoon' | '';
  locationPreference: 'south' | 'center' | 'north' | '';
  preferences: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  authProvider?: string;
  profilePicture?: string;
  partnerInvitePending?: boolean;
  partnerInviteAccepted?: boolean;
}

export default function EditProfilePage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    weddingDate: '',
    partnerName: '',
    partnerPhone: '',
    partnerEmail: '',
    expectedGuests: '',
    budget: '',
    venueType: '',
    timeOfDay: '',
    locationPreference: '',
    preferences: {
      venue: false,
      catering: false,
      photography: false,
      music: false,
      design: false,
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'expired' | 'accepted' | 'error'>('idle');
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthReady) {
        console.log('Auth not ready yet');
        return;
      }

      console.log('Auth state:', { isAuthReady, user: user?._id });

      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      if (params.id !== user._id) {
        console.log('User ID mismatch:', { paramsId: params.id, userId: user._id });
        router.push(`/user/${user._id}/edit`);
        return;
      }

      await fetchUserProfile();
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      if (!params.id) {
        throw new Error('No user ID provided');
      }

      const response = await fetch(`/api/user/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch user data');
      
      const userData = data.user;
      setProfile(userData);

      // עיבוד התאריך לפורמט המתאים לשדה input מסוג date
      const formattedDate = userData.weddingDate 
        ? new Date(userData.weddingDate).toISOString().split('T')[0]
        : '';

      setFormData({
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        weddingDate: formattedDate,
        partnerName: userData.partnerName || '',
        partnerPhone: userData.partnerPhone || '',
        partnerEmail: userData.partnerEmail || '',
        expectedGuests: userData.expectedGuests || '',
        budget: userData.budget || '',
        venueType: userData.venueType || '',
        timeOfDay: userData.timeOfDay || '',
        locationPreference: userData.locationPreference || '',
        preferences: {
          venue: Boolean(userData.preferences?.venue),
          catering: Boolean(userData.preferences?.catering),
          photography: Boolean(userData.preferences?.photography),
          music: Boolean(userData.preferences?.music),
          design: Boolean(userData.preferences?.design)
        }
      });

      // Set invitation status
      if (userData.partnerInviteAccepted) {
        setInviteStatus('accepted');
        setInviteMessage(`${userData.partnerName || 'השותף/ה'} כבר מחובר/ת לחשבון`);
      } else if (userData.partnerInvitePending) {
        setInviteStatus('sent');
        setInviteMessage(`הזמנה נשלחה ל-${userData.partnerEmail}`);
      } else {
        setInviteStatus('idle');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (key: keyof typeof formData.preferences) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch(`/api/user/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccessMessage('הפרופיל עודכן בהצלחה!');
      
      // הסרת ההודעה אחרי 3 שניות
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Update failed:', err);
      setError(err instanceof Error ? err.message : 'עדכון הפרופיל נכשל');
    }
  };

  const handleInvitePartner = async () => {
    if (!formData.partnerEmail) {
      setError('אנא הזן את כתובת האימייל של בן/בת הזוג');
      return;
    }

    setInviteStatus('sending');
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/invite-partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: params.id,
          partnerEmail: formData.partnerEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invitation');
      }

      setInviteStatus('sent');
      setInviteMessage(`הזמנה נשלחה ל-${formData.partnerEmail}`);
      setSuccessMessage('הזמנה נשלחה בהצלחה!');

      // Update the user data after sending invitation
      await fetchUserProfile();
      
      // הסרת ההודעה אחרי 3 שניות
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Invitation failed:', err);
      setInviteStatus('error');
      setError(err instanceof Error ? err.message : 'שליחת ההזמנה נכשלה');
    }
  };

  if (!isAuthReady || isLoading) {
    return (
      <LoadingSpinner 
        text="טוען את פרטי המשתמש..." 
        size="large"
        fullScreen={true}
        color="pink"
        bgOpacity={0.9}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-500 text-xl font-bold mb-4">שגיאה בטעינת הנתונים</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => { 
                setIsLoading(true);
                setError('');
                fetchUserProfile()
                  .finally(() => setIsLoading(false));
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              נסה שנית
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>הפרופיל לא נמצא</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
        <h1 style={styles.title}>עריכת פרופיל</h1>
        
        {successMessage && (
          <div style={styles.successMessage}>{successMessage}</div>
        )}
        
        {error && (
          <div style={styles.errorMessage}>{error}</div>
        )}

        {profile.authProvider === 'google' && profile.profilePicture && (
          <div style={styles.profileImageContainer}>
            <img 
              src={profile.profilePicture} 
              alt="Profile" 
              style={styles.profileImage}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.gridContainer}>
            {/* Personal Details Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>פרטים אישיים</h3>
              
              <div style={styles.fieldContainer}>
                <label htmlFor="fullName" style={styles.label}>שם מלא</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldContainer}>
                <label htmlFor="phone" style={styles.label}>טלפון</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldContainer}>
                <label htmlFor="email" style={styles.label}>אימייל</label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  style={{ ...styles.input, backgroundColor: '#f5f5f5' }}
                  disabled
                />
              </div>
            </div>

            {/* Wedding Details Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>פרטי האירוע</h3>
              
              <div style={styles.fieldContainer}>
                <label htmlFor="venueType" style={styles.label}>מיקום האירוע</label>
                <select
                  id="venueType"
                  name="venueType"
                  value={formData.venueType}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">בחרו את סוג המקום</option>
                  <option value="garden">גן אירועים</option>
                  <option value="nature">אירוע בטבע</option>
                </select>
              </div>

              <div style={styles.fieldContainer}>
                <label htmlFor="timeOfDay" style={styles.label}>שעת האירוע</label>
                <select
                  id="timeOfDay"
                  name="timeOfDay"
                  value={formData.timeOfDay}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">בחרו את שעת האירוע</option>
                  <option value="evening">חתונת ערב</option>
                  <option value="afternoon">חתונת צהריים</option>
                </select>
              </div>

              <div style={styles.fieldContainer}>
                <label htmlFor="locationPreference" style={styles.label}>אזור בארץ</label>
                <select
                  id="locationPreference"
                  name="locationPreference"
                  value={formData.locationPreference}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">בחרו את האזור המועדף</option>
                  <option value="south">דרום</option>
                  <option value="center">מרכז</option>
                  <option value="north">צפון</option>
                </select>
              </div>

              <div style={styles.fieldContainer}>
                <label htmlFor="weddingDate" style={styles.label}>תאריך החתונה</label>
                <input
                  id="weddingDate"
                  type="date"
                  name="weddingDate"
                  value={formData.weddingDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldContainer}>
                <label htmlFor="partnerName" style={styles.label}>שם בן/בת הזוג</label>
                <input
                  id="partnerName"
                  type="text"
                  name="partnerName"
                  value={formData.partnerName}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldContainer}>
                <label htmlFor="partnerPhone" style={styles.label}>טלפון בן/בת הזוג</label>
                <input
                  id="partnerPhone"
                  type="tel"
                  name="partnerPhone"
                  value={formData.partnerPhone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.partnerEmailContainer}>
                <label htmlFor="partnerEmail" style={styles.label}>אימייל בן/בת הזוג</label>
                <div style={styles.partnerEmailWrapper}>
                  <input
                    id="partnerEmail"
                    type="email"
                    name="partnerEmail"
                    value={formData.partnerEmail}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      borderTopRightRadius: '4px',
                      borderBottomRightRadius: '4px',
                      borderTopLeftRadius: '0',
                      borderBottomLeftRadius: '0',
                      borderRight: '1px solid #ddd',
                      width: 'calc(100% - 150px)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleInvitePartner}
                    disabled={inviteStatus === 'sending' || inviteStatus === 'accepted' || !formData.partnerEmail}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '4px 0 0 4px',
                      border: '1px solid',
                      fontSize: '0.9rem',
                      width: '150px',
                      transition: 'all 0.3s ease',
                      cursor: inviteStatus === 'sending' || inviteStatus === 'accepted' || !formData.partnerEmail ? 'not-allowed' : 'pointer',
                      backgroundColor: 
                        inviteStatus === 'accepted' ? '#4CAF50' :
                        inviteStatus === 'sent' ? '#FFA500' : 
                        inviteStatus === 'sending' ? '#cccccc' : 
                        inviteStatus === 'error' ? '#f44336' : 
                        '#0070f3',
                      borderColor: 
                        inviteStatus === 'accepted' ? '#388E3C' :
                        inviteStatus === 'sent' ? '#FF8C00' : 
                        inviteStatus === 'sending' ? '#bbbbbb' : 
                        inviteStatus === 'error' ? '#D32F2F' : 
                        '#0062cc',
                      color: 'white',
                    }}
                  >
                    {inviteStatus === 'accepted' ? '✓ מחובר' : 
                     inviteStatus === 'sent' ? 'שלח שוב' : 
                     inviteStatus === 'sending' ? '...שולח' : 
                     inviteStatus === 'error' ? 'נסה שוב' : 
                     'שלח הזמנה'}
                  </button>
                </div>
                {inviteStatus === 'sent' && (
                  <p style={styles.inviteMessage}>{inviteMessage}</p>
                )}
                {inviteStatus === 'accepted' && (
                  <p style={styles.inviteMessageSuccess}>{inviteMessage}</p>
                )}
              </div>

              <div style={styles.fieldContainer}>
                <label htmlFor="expectedGuests" style={styles.label}>מספר אורחים משוער</label>
                <input
                  id="expectedGuests"
                  type="number"
                  name="expectedGuests"
                  value={formData.expectedGuests}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldContainer}>
                <label htmlFor="budget" style={styles.label}>תקציב משוער</label>
                <input
                  id="budget"
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div style={styles.preferencesSection}>
            <h3 style={styles.sectionTitle}>שירותים נדרשים</h3>
            <div style={styles.preferencesGrid}>
              {Object.entries(formData.preferences).map(([key, value]) => (
                <label key={key} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handlePreferenceChange(key as keyof typeof formData.preferences)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>
                    {key === 'venue' && 'אולם אירועים'}
                    {key === 'catering' && 'קייטרינג'}
                    {key === 'photography' && 'צילום'}
                    {key === 'music' && 'מוזיקה'}
                    {key === 'design' && 'עיצוב'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" style={styles.button}>
            שמור שינויים
          </button>
        </form>
      </div>
    </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffe4ec 0%, #fff 60%, #ffe4ec 100%)',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  content: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px 0 rgba(245, 158, 158, 0.12)',
    border: '1.5px solid #fbcfe8',
    padding: '2.5rem 2rem',
    marginTop: '3rem',
    maxWidth: '540px',
    width: '100%',
    position: 'relative',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 800,
    marginBottom: '2rem',
    background: 'linear-gradient(90deg, #f472b6 0%, #f9a8d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textAlign: 'center',
    letterSpacing: '0.02em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
  },
  section: {
    background: 'rgba(255,245,248,0.7)',
    borderRadius: '1.5rem',
    padding: '1.5rem 1rem',
    boxShadow: '0 2px 8px 0 #fbcfe8',
    border: '1px solid #fbcfe8',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#be185d',
    marginBottom: '1.2rem',
    letterSpacing: '0.01em',
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.2rem',
  },
  label: {
    fontWeight: 500,
    color: '#be185d',
    fontSize: '1rem',
    marginBottom: '0.2rem',
  },
  input: {
    border: '1.5px solid #fbcfe8',
    borderRadius: '999px',
    padding: '0.7rem 1.2rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.2s',
    background: '#fff',
    color: '#be185d',
    fontWeight: 500,
    boxShadow: '0 1px 4px 0 #fbcfe8',
  },
  successMessage: {
    background: 'linear-gradient(90deg, #f9a8d4 0%, #fbcfe8 100%)',
    color: '#be185d',
    borderRadius: '999px',
    padding: '0.8rem 1.2rem',
    textAlign: 'center',
    fontWeight: 700,
    marginBottom: '1.2rem',
    fontSize: '1.1rem',
    border: '1.5px solid #fbcfe8',
    boxShadow: '0 2px 8px 0 #fbcfe8',
  },
  errorMessage: {
    background: 'linear-gradient(90deg, #fca5a5 0%, #fbcfe8 100%)',
    color: '#b91c1c',
    borderRadius: '999px',
    padding: '0.8rem 1.2rem',
    textAlign: 'center',
    fontWeight: 700,
    marginBottom: '1.2rem',
    fontSize: '1.1rem',
    border: '1.5px solid #fca5a5',
    boxShadow: '0 2px 8px 0 #fca5a5',
  },
  profileImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  profileImage: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    border: '3px solid #f472b6',
    objectFit: 'cover',
    boxShadow: '0 2px 8px 0 #fbcfe8',
  },
  button: {
    background: 'linear-gradient(90deg, #f472b6 0%, #f9a8d4 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    padding: '0.9rem 2.2rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px 0 #fbcfe8',
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
  },
  buttonHover: {
    background: 'linear-gradient(90deg, #f472b6 0%, #be185d 100%)',
    boxShadow: '0 4px 16px 0 #fbcfe8',
    transform: 'scale(1.04)',
  },
  preferencesSection: {
    marginTop: '2rem',
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
  },
  preferencesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
  checkboxText: {
    fontSize: '0.9rem',
    color: '#666',
  },
  inviteMessage: {
    fontSize: '0.8rem',
    color: '#FF8C00',
    marginTop: '0.5rem',
  },
  inviteMessageSuccess: {
    fontSize: '0.8rem',
    color: '#388E3C',
    marginTop: '0.5rem',
  },
  loadingSpinner: {
    textAlign: 'center' as const,
    padding: '2rem',
  },
}; 