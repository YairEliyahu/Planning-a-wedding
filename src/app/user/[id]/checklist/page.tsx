'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ChecklistItem {
  id: string;
  name: string;
  budget: string;
  isCompleted: boolean;
  category: 'vendors' | 'attire' | 'ceremony' | 'other';
}

interface WeddingChecklist {
  userId: string;
  items: ChecklistItem[];
  totalBudget: string;
}

export default function ChecklistPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [checklist, setChecklist] = useState<WeddingChecklist>({
    userId: params.id,
    items: [
      // ספקים
      { id: '1', name: 'אולם/גן אירועים', budget: '', isCompleted: false, category: 'vendors' },
      { id: '2', name: 'קייטרינג', budget: '', isCompleted: false, category: 'vendors' },
      { id: '3', name: 'צלם', budget: '', isCompleted: false, category: 'vendors' },
      { id: '4', name: 'צלם וידאו', budget: '', isCompleted: false, category: 'vendors' },
      { id: '5', name: 'תקליטן/להקה', budget: '', isCompleted: false, category: 'vendors' },
      { id: '6', name: 'עיצוב ופרחים', budget: '', isCompleted: false, category: 'vendors' },
      
      // לבוש ואביזרים
      { id: '7', name: 'שמלת כלה', budget: '', isCompleted: false, category: 'attire' },
      { id: '8', name: 'חליפת חתן', budget: '', isCompleted: false, category: 'attire' },
      { id: '9', name: 'טבעות', budget: '', isCompleted: false, category: 'attire' },
      { id: '10', name: 'תכשיטים ואקססוריז', budget: '', isCompleted: false, category: 'attire' },
      
      // טקס
      { id: '11', name: 'רב', budget: '', isCompleted: false, category: 'ceremony' },
      { id: '12', name: 'חופה', budget: '', isCompleted: false, category: 'ceremony' },
      
      // שונות
      { id: '13', name: 'הזמנות', budget: '', isCompleted: false, category: 'other' },
      { id: '14', name: 'מתנות לאורחים', budget: '', isCompleted: false, category: 'other' },
      { id: '15', name: 'הסעות', budget: '', isCompleted: false, category: 'other' },
    ],
    totalBudget: '0'
  });

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

      if (user._id !== params.id) {
        console.log('User ID mismatch:', { userId: user._id, paramsId: params.id });
        router.push(`/user/${user._id}/checklist`);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching checklist for user:', params.id);
        const response = await fetch(`/api/wedding-checklist/${params.id}`);
        const data = await response.json();
        if (response.ok) {
          console.log('Checklist fetched successfully');
          setChecklist(data.checklist);
        } else {
          console.error('Failed to fetch checklist:', data.message);
          setError(data.message || 'Failed to fetch checklist');
        }
      } catch (error) {
        console.error('Error fetching checklist:', error);
        setError('Failed to fetch checklist');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  if (!isAuthReady || isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>טוען...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  const handleBudgetChange = (id: string, value: string) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, budget: value } : item
      )
    }));
  };

  const handleCheckItem = (id: string) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    }));
  };

  const saveChecklist = async () => {
    try {
      const response = await fetch(`/api/wedding-checklist/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checklist),
      });
      
      if (response.ok) {
        alert('הרשימה נשמרה בהצלחה!');
      }
    } catch (error) {
      console.error('Failed to save checklist:', error);
      alert('שגיאה בשמירת הרשימה');
    }
  };

  const getTotalBudget = () => {
    return checklist.items.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>רשימת משימות לחתונה</h1>
      
      <div style={styles.checklistContainer}>
        {['vendors', 'attire', 'ceremony', 'other'].map(category => (
          <div key={category} style={styles.category}>
            <h2 style={styles.categoryTitle}>
              {category === 'vendors' && 'ספקים'}
              {category === 'attire' && 'לבוש ואביזרים'}
              {category === 'ceremony' && 'טקס'}
              {category === 'other' && 'שונות'}
            </h2>
            
            {checklist.items
              .filter(item => item.category === category)
              .map(item => (
                <div key={item.id} style={styles.item}>
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => handleCheckItem(item.id)}
                    style={styles.checkbox}
                  />
                  <span style={item.isCompleted ? styles.completedText : styles.itemText}>
                    {item.name}
                  </span>
                  <div style={styles.budgetInput}>
                    <input
                      type="number"
                      value={item.budget}
                      onChange={(e) => handleBudgetChange(item.id, e.target.value)}
                      placeholder="תקציב"
                      style={styles.input}
                      min="0"
                      step="100"
                    />
                    <span style={styles.currencySymbol}>₪</span>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      <div style={styles.summary}>
        <h3>סה&quot;כ תקציב מתוכנן: ₪{getTotalBudget().toLocaleString()}</h3>
      </div>

      <button onClick={saveChecklist} style={styles.saveButton}>
        שמור רשימה
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    textAlign: 'center' as const,
    marginBottom: '2rem',
    color: '#333',
  },
  checklistContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '2rem',
  },
  category: {
    marginBottom: '2rem',
  },
  categoryTitle: {
    fontSize: '1.5rem',
    color: '#0070f3',
    marginBottom: '1rem',
    borderBottom: '2px solid #0070f3',
    paddingBottom: '0.5rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #eee',
  },
  checkbox: {
    marginRight: '1rem',
    width: '20px',
    height: '20px',
  },
  itemText: {
    flex: 1,
    fontSize: '1.1rem',
  },
  completedText: {
    flex: 1,
    fontSize: '1.1rem',
    textDecoration: 'line-through',
    color: '#888',
  },
  budgetInput: {
    position: 'relative' as const,
    width: '150px',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    paddingRight: '25px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  currencySymbol: {
    position: 'absolute' as const,
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
  },
  summary: {
    marginTop: '2rem',
    textAlign: 'center' as const,
    fontSize: '1.2rem',
    color: '#333',
  },
  saveButton: {
    display: 'block',
    margin: '2rem auto',
    padding: '1rem 2rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  loadingSpinner: {
    fontSize: '1.5rem',
    textAlign: 'center' as const,
    color: '#666',
  },
  error: {
    color: '#ff0000',
    textAlign: 'center' as const,
    marginTop: '1rem',
  },
};