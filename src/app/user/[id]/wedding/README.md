# Wedding Page Refactor - React Query + Context Architecture

## Overview

זהו refactor מלא של דף החתונה המקורי (`page.tsx`) למבנה מודולרי ומתקדם המשתמש ב-React Query עבור ניהול state ו-Context API עבור state sharing בין קומפוננטים.

## Architecture Overview

```
wedding/
├── README.md                           # תיעוד זה
├── page.tsx                           # הקובץ המקורי (ללא שינוי)
├── page-new.tsx                       # הגרסה המרפקטרת
├── types/
│   └── wedding.types.ts               # כל הטיפוסים והממשקים
├── services/
│   └── weddingService.ts              # שכבת שירותים לקריאות API
├── providers/
│   └── QueryProvider.tsx             # React Query provider setup
├── hooks/
│   └── useWeddingData.ts              # Custom hooks עבור React Query
├── context/
│   └── WeddingContext.tsx             # Context עבור ניהול state
└── components/
    ├── WeddingPreferencesForm.tsx     # טופס העדפות חתונה
    ├── WeddingPreferencesSummary.tsx  # סיכום העדפות חתונה
    └── WeddingLoadingAndError.tsx     # טיפול בטעינה ושגיאות
```

## Key Features

### 🚀 React Query Integration
- **Automatic caching** - נתונים נשמרים במטמון ל-5 דקות
- **Background refetching** - רענון אוטומטי של נתונים ברקע
- **Optimistic updates** - עדכון מיידי של UI לפני קבלת תשובה מהשרת
- **Error handling** - טיפול מתקדם בשגיאות עם retry logic
- **Auto-refresh** - רענון אוטומטי עבור משתמשים מחוברים

### 🏗️ Modular Architecture
- **Service Layer** - הפרדה בין לוגיקת API לקומפוננטים
- **Context Provider** - ניהול state מרכזי עם React Context
- **Typed Interface** - TypeScript מלא עם interfaces מפורטים
- **Component Separation** - קומפוננטים קטנים ומתמחים

### 🔧 Developer Experience
- **React Query Devtools** - כלי debug מתקדם (dev mode)
- **Type Safety** - TypeScript מלא עם בדיקות קומפילציה
- **Error Boundaries** - טיפול בשגיאות ברמת הקומפוננט
- **Code Splitting** - טעינה מתונה של קומפוננטים

## Migration Guide

### שלב 1: התקנת Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### שלב 2: החלפת הקובץ הקיים

1. **גיבוי הקובץ המקורי:**
   ```bash
   mv page.tsx page-original.tsx
   ```

2. **שינוי שם הקובץ החדש:**
   ```bash
   mv page-new.tsx page.tsx
   ```

### שלב 3: עדכון App-Level Providers (אופציונלי)

אם רוצים להוסיף את React Query ברמת האפליקציה כולה:

```tsx
// app/layout.tsx או app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### שלב 4: בדיקת התפקוד

1. וודאו שהדף נטען כרגיל
2. בדקו שמירת העדפות עובדת
3. בדקו שרענון אוטומטי עובד למשתמשים מחוברים
4. בדקו טיפול בשגיאות

## API Reference

### Types (`types/wedding.types.ts`)

#### Core Interfaces
- `UserProfile` - פרופיל משתמש מלא
- `WeddingPreferences` - העדפות חתונה
- `WeddingContextValue` - ממשק ה-Context

#### Response Types
- `UserProfileResponse` - תשובת API לפרופיל משתמש
- `WeddingPreferencesResponse` - תשובת API להעדפות חתונה

### Services (`services/weddingService.ts`)

#### Methods
```typescript
// קבלת פרופיל משתמש
getUserProfile(userId: string): Promise<UserProfile>

// עדכון פרופיל משתמש
updateUserProfile(userId: string, data: UserUpdateRequest): Promise<UserProfile>

// קבלת העדפות חתונה
getWeddingPreferences(userId: string): Promise<WeddingPreferencesAPI | null>

// שמירת העדפות חתונה
saveWeddingPreferences(userId: string, prefs: WeddingPreferencesAPI): Promise<WeddingPreferencesAPI>

// קבלת כל נתוני החתונה
getWeddingData(userId: string): Promise<{profile: UserProfile, preferences: WeddingPreferences}>

// שמירת כל נתוני החתונה
saveWeddingData(userId: string, prefs: WeddingPreferences): Promise<{profile: UserProfile, preferences: WeddingPreferencesAPI}>
```

### Hooks (`hooks/useWeddingData.ts`)

#### React Query Hooks
```typescript
// קבלת נתוני חתונה
useWeddingData(userId: string)

// קבלת פרופיל משתמש בלבד
useUserProfile(userId: string)

// קבלת העדפות חתונה בלבד
useWeddingPreferences(userId: string)

// שמירת נתוני חתונה
useSaveWeddingData(userId: string)

// רענון נתונים
useRefreshWeddingData()

// רענון אוטומטי למשתמשים מחוברים
useAutoRefreshWeddingData(userId: string, isConnectedUser: boolean)
```

### Context (`context/WeddingContext.tsx`)

#### Context Value
```typescript
interface WeddingContextValue {
  // State
  profile: UserProfile | null;
  preferences: WeddingPreferences;
  savedPreferences: WeddingPreferences | null;
  isLoading: boolean;
  error: string;
  
  // Actions
  updatePreferences: (preferences: Partial<WeddingPreferences>) => void;
  savePreferences: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}
```

#### Usage
```typescript
const { 
  profile, 
  preferences, 
  updatePreferences, 
  savePreferences 
} = useWeddingContext();
```

### Components

#### `WeddingPreferencesForm`
טופס להזנת העדפות חתונה עם validation מלא.

#### `WeddingPreferencesSummary`
הצגת סיכום העדפות החתונה השמורות.

#### `WeddingLoadingAndError`
קומפוננט לטיפול בטעינה ושגיאות עם retry functionality.

## Performance Optimizations

### Caching Strategy
- **Stale Time**: 5 דקות - נתונים נחשבים טריים למשך 5 דקות
- **GC Time**: 10 דקות - נתונים נשמרים במטמון 10 דקות
- **Auto-refetch**: רענון אוטומטי כל 30 שניות למשתמשים מחוברים

### Bundle Optimization
- **Code Splitting**: כל קומפוננט טוען רק כשנדרש
- **Tree Shaking**: רק פונקציות שבשימוש נכללות בבנייה
- **Lazy Loading**: קומפוננטים נטענים על פי דרישה

## Debugging

### React Query Devtools
במצב development, זמין React Query Devtools:
- לחצו על הכפתור הקטן בפינה התחתונה
- בדקו cache state, queries status, mutations

### Console Logs
הקוד כולל לוגים מפורטים:
- `Wedding preferences saved successfully`
- `Auto-refreshing wedding data for connected accounts`
- `Failed to fetch wedding data`

### Common Issues

#### שגיאת "useWeddingContext must be used within a WeddingProvider"
**פתרון:** וודאו שהקומפוננט עטוף ב-`WeddingProvider`

#### נתונים לא מתעדכנים
**פתרון:** בדקו שה-`userId` תקין ושהרשת פועלת

#### שגיאות TypeScript
**פתרון:** וודאו שכל ה-interfaces מיובאים נכון

## Testing

### Unit Tests
```typescript
// דוגמה לבדיקת service
import { weddingService } from './services/weddingService';

test('should fetch wedding data', async () => {
  const data = await weddingService.getWeddingData('user123');
  expect(data.profile).toBeDefined();
  expect(data.preferences).toBeDefined();
});
```

### Integration Tests
```typescript
// דוגמה לבדיקת קומפוננט
import { render, screen } from '@testing-library/react';
import WeddingPreferencesForm from './components/WeddingPreferencesForm';

test('should render wedding form', () => {
  render(<WeddingPreferencesForm />);
  expect(screen.getByText('מיקום האירוע')).toBeInTheDocument();
});
```

## Rollback Plan

במקרה של בעיות, ניתן לחזור לגרסה המקורית:

```bash
# גיבוי הגרסה החדשה
mv page.tsx page-new-backup.tsx

# החזרת הגרסה המקורית
mv page-original.tsx page.tsx
```

## Future Enhancements

### Planned Features
- [ ] **Offline Support** - שמירה מקומית כשאין רשת
- [ ] **Real-time Updates** - עדכונים בזמן אמת עם WebSockets
- [ ] **Form Validation** - validation מתקדם עם React Hook Form
- [ ] **Animations** - אנימציות מתקדמות עם Framer Motion
- [ ] **PWA Support** - תמיכה ב-Progressive Web App

### Performance Improvements
- [ ] **Infinite Queries** - טעינה מתונה של רשימות
- [ ] **Parallel Queries** - שאילתות מקבילות
- [ ] **Background Sync** - סנכרון ברקע

## Contributing

### Code Style
- השתמשו ב-TypeScript עם `strict: true`
- עקבו אחר ESLint rules הקיימים
- הוסיפו JSDoc לפונקציות ציבוריות
- השתמשו ב-conventional commits

### Pull Request Process
1. צרו branch חדש מ-`main`
2. הוסיפו tests לשינויים
3. וודאו ש-TypeScript עובר ללא שגיאות
4. עדכנו תיעוד במידת הצורך
5. פתחו PR עם תיאור מפורט

---

📝 **Note**: מסמך זה מתעדכן באופן שוטף. לשאלות או בעיות, פתחו issue בגיטהאב. 