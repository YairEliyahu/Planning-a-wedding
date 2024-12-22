'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function ChecklistPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'בחירת אולם אירועים', completed: false },
    { id: 2, text: 'בחירת רב לחתונה', completed: false },
    { id: 3, text: 'הזמנת צלם', completed: false },
    { id: 4, text: 'בחירת שמלת כלה', completed: false },
    { id: 5, text: 'בחירת חליפת חתן', completed: false },
    { id: 6, text: 'הזמנת די ג׳יי', completed: false },
    { id: 7, text: 'עיצוב הזמנות', completed: false },
    { id: 8, text: 'בחירת טבעות', completed: false },
    { id: 9, text: 'הזמנת קייטרינג', completed: false },
    { id: 10, text: 'תכנון ירח דבש', completed: false },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // טעינת המשימות מהשרת
    loadTasks();
  }, [user, router]);

  const loadTasks = async () => {
    try {
      const response = await fetch(`/api/checklist/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const saveTasks = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      const response = await fetch(`/api/checklist/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks }),
      });

      if (response.ok) {
        setSaveStatus('success');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save tasks:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>צ׳ק ליסט לחתונה</h1>
      
      <div style={styles.taskList}>
        {tasks.map(task => (
          <div key={task.id} style={styles.taskItem}>
            <div 
              style={{
                ...styles.checkbox,
                ...(task.completed ? styles.checkboxChecked : {})
              }}
              onClick={() => toggleTask(task.id)}
            >
              {task.completed && <span style={styles.checkmark}>✓</span>}
            </div>
            <span style={{
              ...styles.taskText,
              ...(task.completed ? styles.taskCompleted : {})
            }}>
              {task.text}
            </span>
          </div>
        ))}
      </div>

      <button 
        onClick={saveTasks} 
        style={styles.saveButton}
        disabled={isSaving}
      >
        {isSaving ? 'שומר...' : 'שמור שינויים'}
      </button>

      {saveStatus && (
        <div style={{
          ...styles.statusMessage,
          ...(saveStatus === 'success' ? styles.successMessage : styles.errorMessage)
        }}>
          {saveStatus === 'success' ? 'נשמר בהצלחה!' : 'שגיאה בשמירה'}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  taskList: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #0070f3',
    marginRight: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  checkboxChecked: {
    backgroundColor: '#0070f3',
    borderColor: '#0070f3',
  },
  checkmark: {
    color: '#fff',
    fontSize: '14px',
  },
  taskText: {
    fontSize: '1.1rem',
    color: '#333',
  },
  taskCompleted: {
    textDecoration: 'line-through',
    color: '#888',
  },
  saveButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    marginTop: '2rem',
    width: '100%',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#0060df',
    },
    '&:disabled': {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
  },
  statusMessage: {
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem',
    textAlign: 'center' as const,
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
};
