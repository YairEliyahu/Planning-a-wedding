# Seating Arrangements - Refactored Architecture

## 📋 Overview

This module has been refactored from a monolithic `page.tsx` to a modular, maintainable architecture using React Query, Context API, and component separation.

## 🏗️ Architecture

### Directory Structure
```
src/app/user/[id]/seating/
├── page.tsx                 # Original file (preserved)
├── page-new.tsx            # Refactored version
├── types/
│   └── index.ts            # TypeScript interfaces
├── services/
│   ├── guestService.ts     # Guest-related API calls
│   └── seatingService.ts   # Seating-related API calls
├── providers/
│   └── QueryProvider.tsx  # React Query configuration
├── context/
│   └── SeatingContext.tsx  # State management with React Query
├── components/
│   ├── UnassignedGuestsList.tsx
│   ├── SeatingMap.tsx
│   ├── Statistics.tsx
│   ├── EventSetupModal.tsx
│   ├── TableDetailModal.tsx
│   ├── AddTableModal.tsx
│   └── ClearConfirmModal.tsx
└── README.md
```

## 🚀 Key Improvements

### 1. **React Query Integration**
- **Caching**: 5-minute stale time, 10-minute garbage collection
- **Error Handling**: Automatic retry with exponential backoff
- **Background Updates**: Refetch on window focus and reconnect
- **Optimistic Updates**: Better UX for mutations

### 2. **Service Layer**
- **Separation of Concerns**: API logic separated from components
- **Reusability**: Services can be used across different components
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Centralized error management

### 3. **Context Architecture**
- **State Management**: Centralized state with React Context
- **Performance**: Selective re-renders with useCallback
- **Business Logic**: Centralized in context hooks

### 4. **Component Separation**
- **Maintainability**: Small, focused components
- **Reusability**: Components can be used independently
- **Testing**: Easier to unit test individual components

## 📦 Dependencies

### Required Packages
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Existing Dependencies (already installed)
- React 18+
- Next.js 13+
- TypeScript
- Framer Motion
- Tailwind CSS

## 🔄 Migration Guide

### Step 1: Install Dependencies
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Step 2: Update Layout (Optional)
Add QueryProvider to your layout if you want React Query available globally:

```tsx
// src/app/layout.tsx
import { QueryProvider } from './user/[id]/seating/providers/QueryProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

### Step 3: Replace Page Component
Replace the content of `page.tsx` with:

```tsx
// src/app/user/[id]/seating/page.tsx
export { default } from './page-new';
```

### Step 4: Test the Migration
1. Navigate to the seating arrangements page
2. Verify all functionality works:
   - ✅ Guest loading and display
   - ✅ Table creation and management
   - ✅ Drag and drop functionality
   - ✅ Auto-assignment algorithms
   - ✅ Save/load functionality
   - ✅ Modal interactions

## 🧪 Testing

### Component Testing
```bash
# Test individual components
npm test -- UnassignedGuestsList
npm test -- SeatingMap
npm test -- Statistics
```

### Service Testing
```bash
# Test service layer
npm test -- guestService
npm test -- seatingService
```

### E2E Testing
```bash
# Test complete workflows
npm run e2e:seating
```

## 🔧 Configuration

### React Query Settings
Located in `providers/QueryProvider.tsx`:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 10 * 60 * 1000,       // 10 minutes
      retry: 2,                      // Retry failed requests
      refetchOnWindowFocus: true,    // Refetch on focus
    },
  },
});
```

### Context Configuration
Located in `context/SeatingContext.tsx`:

```tsx
// Debounced localStorage saves
useEffect(() => {
  const timeoutId = setTimeout(() => {
    seatingService.saveMapViewState(zoomLevel, mapPosition);
  }, 500);
  return () => clearTimeout(timeoutId);
}, [zoomLevel, mapPosition]);
```

## 📊 Performance Optimizations

### 1. **Memoization**
- All business logic functions use `useCallback`
- Context value is memoized to prevent unnecessary re-renders

### 2. **Code Splitting**
- Services are dynamically imported in QueryProvider
- Components are lazy-loaded where appropriate

### 3. **Caching Strategy**
- React Query handles all caching automatically
- localStorage for user preferences (zoom, position)
- Optimistic updates for better UX

### 4. **Bundle Size**
- Tree-shaking enabled for all services
- No unnecessary re-exports

## 🐛 Troubleshooting

### Common Issues

#### 1. **Query Not Updating**
```tsx
// Force refetch
const { refetch } = useQuery(...);
refetch();

// Or invalidate cache
queryClient.invalidateQueries(['guests', userId]);
```

#### 2. **Context Not Available**
Make sure components are wrapped in providers:
```tsx
<QueryProvider>
  <SeatingProvider userId={userId}>
    <YourComponent />
  </SeatingProvider>
</QueryProvider>
```

#### 3. **TypeScript Errors**
Ensure all types are imported from `./types`:
```tsx
import { Guest, Table, EventSetupData } from '../types';
```

## 🚦 Development Guidelines

### 1. **Adding New Features**
1. Define types in `types/index.ts`
2. Add service functions if API calls needed
3. Update context if state management required
4. Create/update components
5. Add to page-new.tsx

### 2. **Error Handling**
```tsx
// In services
throw new Error('Descriptive error message');

// In components
const { data, error, isLoading } = useQuery(...);
if (error) {
  console.error('Error:', error);
  // Handle error appropriately
}
```

### 3. **State Updates**
```tsx
// Always use context for state updates
const { setTables, assignGuestToTable } = useSeating();

// Never mutate state directly
// ❌ tables.push(newTable)
// ✅ setTables(prev => [...prev, newTable])
```

## 📈 Monitoring

### React Query Devtools
Available in development mode:
- Open browser devtools
- Navigate to "React Query" tab
- Monitor queries, mutations, and cache

### Performance Monitoring
```tsx
// Add to components for performance insights
React.Profiler onRender={(id, phase, actualDuration) => {
  console.log('Render:', { id, phase, actualDuration });
}}
```

## 🔮 Future Enhancements

### Planned Features
1. **Offline Support**: Service workers for offline functionality
2. **Real-time Updates**: WebSocket integration for collaborative editing
3. **Advanced Caching**: Persistent cache with IndexedDB
4. **Performance Metrics**: Built-in performance monitoring
5. **A/B Testing**: Feature flag integration

### Migration Path
This refactor maintains 100% backward compatibility. You can:
1. Keep using `page.tsx` (original)
2. Gradually migrate to `page-new.tsx`
3. Eventually replace `page.tsx` with the refactored version

## 📚 Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [TypeScript React Patterns](https://react-typescript-cheatsheet.netlify.app/)

---

**Note**: The original `page.tsx` is preserved for reference and rollback purposes. Remove it only after thorough testing of the refactored version. 