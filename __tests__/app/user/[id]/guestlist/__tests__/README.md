# תיעוד בדיקות - ניהול רשימת מוזמנים

תיקיית הבדיקות הזאת נבנתה בהתאם לרפקטור החדש של מודול ניהול רשימת המוזמנים, הכולל שימוש ב-React Query ו-Context API.

## מבנה התיקיה

```
__tests__/
├── setup.ts                    # הגדרות בסיסיות עבור Jest
├── jest.config.js             # קובץ הגדרות Jest
├── README.md                  # תיעוד זה
├── mocks/                     # Mock objects ו-data
│   ├── mockData.ts           # נתונים מדומים
│   └── queryClient.ts        # Mock עבור React Query
├── utils/                     # כלי עזר לבדיקות
│   └── testUtils.tsx         # פונקציות רינדור עם providers
├── context/                   # בדיקות עבור Context
│   └── GuestContext.test.tsx # בדיקות ה-GuestContext
├── services/                  # בדיקות עבור Services
│   └── guestService.test.ts  # בדיקות ה-guestService
├── components/                # בדיקות עבור רכיבים
│   ├── GuestTable.test.tsx   # בדיקות טבלת האורחים
│   ├── AddGuestForm.test.tsx # בדיקות טופס הוספת אורח
│   └── GuestFilters.test.tsx # בדיקות מסנני האורחים
├── integration/               # בדיקות אינטגרציה
│   └── guestlist-flow.test.tsx # בדיקות זרימת עבודה
└── e2e/                      # בדיקות End-to-End
    └── guestlist-page.test.tsx # בדיקות הדף הראשי
```

## סוגי הבדיקות

### 1. Unit Tests (בדיקות יחידה)
- **Context Tests**: בדיקות עבור `GuestContext` - מנהל המצב הראשי
- **Service Tests**: בדיקות עבור `guestService` - שכבת ה-API
- **Component Tests**: בדיקות לרכיבי UI בודדים

### 2. Integration Tests (בדיקות אינטגרציה)
- בדיקות זרימת עבודה מקצה לקצה
- בדיקות תקשורת בין רכיבים
- בדיקות הגיונות עסקיים מורכבים

### 3. E2E Tests (בדיקות מקצה לקצה)
- בדיקות הדף הראשי בשלמותו
- בדיקות אינטראקציה עם המשתמש
- בדיקות תרחישי שימוש מלאים

## טכנולוגיות שבשימוש

### בדיקות
- **Jest**: מסגרת הבדיקות הראשית
- **React Testing Library**: בדיקות רכיבי React
- **@testing-library/jest-dom**: matchers נוספים עבור DOM
- **@testing-library/user-event**: סימולציית אינטראקציות משתמש

### Mocking
- **Jest Mocks**: mock פונקציות ומודולים
- **MSW (Mock Service Worker)**: mock עבור API calls (אופציונלי)
- **React Query Mock**: mock עבור React Query

## הרצת הבדיקות

### הרצת כל הבדיקות
```bash
npm test
```

### הרצת בדיקות בהגדרת watch
```bash
npm test -- --watch
```

### הרצת בדיקות עם coverage
```bash
npm test -- --coverage
```

### הרצת בדיקות ספציפיות
```bash
# רק בדיקות context
npm test context

# רק בדיקות services
npm test services

# רק בדיקות components
npm test components
```

## הגדרות מיוחדות

### Mock Data
קובץ `mocks/mockData.ts` מכיל נתונים מדומים המשמשים בבדיקות:
- `mockGuest`: אורח בודד לדוגמה
- `mockGuests`: רשימת אורחים מלאה
- `mockNewGuest`: נתוני אורח חדש לבדיקות הוספה
- `mockStats`: סטטיסטיקות מחושבות

### Test Utils
קובץ `utils/testUtils.tsx` מספק פונקציות עזר:
- `renderWithProviders`: רינדור רכיבים עם Context ו-Query Client
- `mockFetch`: mock עבור API calls
- `createMockFile`: יצירת קבצים מדומים לבדיקות import

## הנחיות כתיבת בדיקות

### עקרונות בסיסיים
1. **AAA Pattern**: Arrange, Act, Assert
2. **One Assertion Per Test**: בדיקה אחת לכל test
3. **Clear Test Names**: שמות תיאוריים ברורים
4. **Setup/Teardown**: ניקוי נכון אחרי בדיקות

### דוגמה לבדיקה טובה
```typescript
describe('GuestContext', () => {
  describe('addGuest', () => {
    it('should add a new guest successfully', async () => {
      // Arrange
      const newGuest = mockNewGuest;
      mockGuestService.addGuest.mockResolvedValue(mockGuest);
      
      // Act
      await result.current.addGuest(newGuest);
      
      // Assert
      expect(mockGuestService.addGuest).toHaveBeenCalledWith({
        ...newGuest,
        userId: 'test-user-id',
      });
    });
  });
});
```

## אזורי כיסוי (Coverage)

הבדיקות מכסות את האזורים הבאים:
- ✅ Context (GuestContext) - מנהל מצב ו-React Query hooks
- ✅ Services (guestService) - פונקציות API
- ✅ Components - רכיבי UI עיקריים
- ✅ Integration - זרימות עבודה מקצה לקצה
- ✅ Error Handling - טיפול בשגיאות
- ✅ Loading States - מצבי טעינה
- ✅ Filters - מנגנוני סינון וחיפוש

## בעיות נפוצות ופתרונות

### בעיית Act Warnings
```typescript
// שימוש ב-act עבור state updates
await act(async () => {
  await result.current.addGuest(mockGuest);
});
```

### בעיית Async/Await
```typescript
// שימוש ב-waitFor עבור async operations
await waitFor(() => {
  expect(result.current.isLoading).toBe(false);
});
```

### בעיית Mock Cleanup
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## שיפורים עתידיים

1. **Visual Regression Tests**: בדיקות שינויים ויזואליים
2. **Performance Tests**: בדיקות ביצועים
3. **Accessibility Tests**: בדיקות נגישות
4. **Cross-browser Tests**: בדיקות דפדפנים שונים
5. **Mobile Tests**: בדיקות מכשירים ניידים

## תחזוקה

### עדכון הבדיקות
- עדכון מידי אחרי כל שינוי בקוד
- עדכון Mock Data בהתאם לשינויים במודל
- עדכון Snapshots אם נדרש

### ביצועים
- הרצת בדיקות במקביל
- שימוש ב-cache עבור dependencies
- אופטימיזציה של Setup/Teardown

עבור שאלות או בעיות, אנא פנו למפתח הראשי של המודול. 