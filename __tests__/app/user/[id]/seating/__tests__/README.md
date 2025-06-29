# Seating Module Tests

מדריך לטסטים של מודול seating במערכת חתונות.

## מצב נוכחי

נוצרה תיקיית טסטים בסיסית עבור מודול seating הכוללת:

### ✅ טסטים שפועלים

- **services.test.ts** - טסטים לשירותי seatingService ו-guestService
  - יצירת פריסת שולחנות
  - ניהול אורחים  
  - עבודה עם localStorage
  - סינון ועיבוד נתונים

### 📋 כיסוי טסטים

#### SeatingService
- ✅ generateTableLayout - יצירת פריסת שולחנות (רגיל, אביר, מעורב, מותאם)
- ✅ createNewTable - יצירת שולחן חדש עם ID ייחודי  
- ✅ localStorage operations - שמירה וטעינה של מצב המפה
- ✅ getAssignedGuestIds - קבלת רשימת אורחים מוושבים

#### GuestService  
- ✅ transformApiGuestsToGuests - המרת נתונים מ-API
- ✅ getConfirmedGuestsCount - ספירת אורחים מאושרים
- ✅ getGuestStatusInfo - קבלת מידע סטטוס אורח
- ✅ filterGuests - סינון אורחים לפי קריטריונים
- ✅ getAvailableGroups - קבלת רשימת קבוצות זמינות

## הרצת טסטים

```bash
# הרצת כל הטסטים
npm test

# הרצת טסטים ספציפיים למודול seating  
npm test seating

# הרצת טסטים עם watch mode
npm run test:watch

# הרצת טסטים עם coverage
npm run test:coverage
```

## דוגמאות לטסטים

### טסט בסיסי לפונקציה

```typescript
it('should generate regular table layout correctly', () => {
  const result = seatingService.generateTableLayout(120, 'regular');
  
  expect(result.tables).toHaveLength(10); // 120 guests / 12 per table
  expect(result.tables[0].capacity).toBe(12);
  expect(result.tables[0].shape).toBe('round');
});
```

### טסט עם נתונים מורכבים

```typescript
it('should count confirmed guests correctly', () => {
  const guests = [
    { isConfirmed: true, numberOfGuests: 2 },
    { isConfirmed: true, numberOfGuests: 1 },
    { isConfirmed: false, numberOfGuests: 3 }
  ];
  
  const count = guestService.getConfirmedGuestsCount(guests);
  expect(count).toBe(3); // 2 + 1 from confirmed guests
});
```

## התוצאות

✅ **הטסטים עוברים בהצלחה** - כל הפונקציות העיקריות נבדקות

✅ **כיסוי טוב** - השירותים העיקריים מכוסים בטסטים

✅ **תאימות** - הטסטים פועלים עם הגדרות Jest הקיימות

## מה חסר (לעתיד)

עקב מגבלות זמן והגדרות מורכבות, הטסטים הבאים לא יושמו:

### קומפוננטים (UI Tests)
- SeatingMap - בדיקות עבור המפה האינטראקטיבית
- UnassignedGuestsList - בדיקות רשימת אורחים
- Statistics - בדיקות קומפוננט הסטטיסטיקות  
- EventSetupModal - בדיקות מודל הגדרת אירוע

### אינטגרציה
- SeatingContext - בדיקות לוגיקה עסקית עם React Query
- API Integration - בדיקות תקשורת עם השרת
- Workflow Tests - בדיקות זרימת עבודה מלאה

### מבנה מתקדם
- MSW מוגדר לחלקים אבל דורש הגדרות נוספות
- Test utilities נוצרו אבל דורשים כוונון
- Custom matchers ו-polyfills דורשים הגדרות נוספות

## מסקנות

הטסטים הבסיסיים מכסים את הפונקציונליות העיקרית של מודול seating:

1. **לוגיקה עסקית** - יצירת שולחנות, ניהול אורחים ✅
2. **עיבוד נתונים** - המרות, סינונים, חישובים ✅  
3. **פונקציות עזר** - localStorage, utilities ✅

זהו בסיס חזק לטסטים נוספים בעתיד. 