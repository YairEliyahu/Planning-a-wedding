# My Profile - Refactored User Profile Page

## Overview
This directory contains a fully refactored version of the user profile page using React Query and modular component architecture. The refactor improves performance, maintainability, and code organization while preserving all existing functionality.

## Directory Structure
```
myprofile/
├── README.md                    # Documentation
├── ../page.tsx                 # Refactored main page (parent directory)
├── providers/QueryProvider.tsx # React Query provider
├── context/UserProfileContext.tsx # Context with React Query
├── services/UserProfileService.ts # API service layer
├── types/profileTypes.ts       # TypeScript types
└── components/                 # Modular components
    ├── WeddingCountdown.tsx
    ├── BudgetAnalysis.tsx
    ├── WalletCard.tsx
    ├── RecentTransactions.tsx
    ├── ProfileDetails.tsx
    └── PasswordAlert.tsx
```

## Migration Guide

### 1. Install Dependencies
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Implementation Complete
The refactored version is already implemented in `../page.tsx` with:
- React Query integration
- Modular components
- Service layer architecture

### 3. Key Improvements
- React Query caching and background updates
- Modular component architecture
- Type-safe service layer
- Optimized performance with lazy loading
- Comprehensive error handling

## Components

- **WeddingCountdown**: Real-time countdown display
- **BudgetAnalysis**: Chart-based budget visualization
- **WalletCard**: Wallet and budget progress
- **RecentTransactions**: Transaction history table
- **ProfileDetails**: Complete profile information
- **PasswordAlert**: Google auth password setup

## API Endpoints
- GET `/api/user/{id}` - User profile
- PUT `/api/user/{id}` - Update profile
- GET `/api/wedding-checklist/{id}` - Checklist data
- GET `/api/wedding-preferences/{id}` - Preferences

## Configuration
- Cache: 5min stale time, 10min garbage collection
- Retry: 2 attempts, skip on auth errors
- DevTools: Available in development mode

## Key Improvements

### 1. React Query Integration
- **Caching**: Automatic data caching with 5-minute stale time
- **Background refetching**: Smart background updates
- **Error handling**: Robust error states and retry logic
- **Loading states**: Granular loading states per query
- **Optimistic updates**: Immediate UI updates for mutations

### 2. Modular Components
- **Separation of concerns**: Each component has a single responsibility
- **Reusability**: Components can be easily reused elsewhere
- **Maintainability**: Easier to test and debug individual components
- **Type safety**: Full TypeScript coverage

### 3. Service Layer
- **API abstraction**: Clean separation between UI and API logic
- **Error handling**: Consistent error handling across all API calls
- **Type safety**: Fully typed API responses
- **Business logic**: Calculation logic separated from UI components

### 4. Context Architecture
- **State management**: Centralized state management with React Query
- **Real-time updates**: Automatic countdown timer and data synchronization
- **Performance**: Optimized re-renders with selective context usage

## Performance Optimizations

1. **Lazy Loading**: Chart component is lazy-loaded
2. **Memoization**: React Query provides automatic memoization
3. **Background Updates**: Smart background refetching
4. **Selective Re-renders**: Context optimization prevents unnecessary re-renders
5. **Bundle Splitting**: Components are importable individually

## Error Handling

The refactored version includes comprehensive error handling:
- **Network errors**: Automatic retry with exponential backoff
- **Authentication errors**: No retry on 401/403
- **Loading states**: Granular loading indicators
- **Fallback UI**: Error boundaries and fallback components

## Development Tools

When running in development mode:
- React Query DevTools are available (bottom-right corner)
- Console logging for debugging
- Type checking with TypeScript

## Testing Recommendations

1. **Unit Tests**: Test individual components with mock providers
2. **Integration Tests**: Test React Query integration
3. **E2E Tests**: Test complete user flows
4. **Performance Tests**: Monitor React Query cache behavior

## Troubleshooting

### Common Issues

1. **React Query not working**
   - Ensure `QueryProvider` wraps your app
   - Check for duplicate React Query versions

2. **Components not rendering**
   - Verify all imports are correct
   - Check TypeScript types match your data

3. **API calls failing**
   - Verify service layer endpoints
   - Check authentication headers

### Debug Mode
Enable React Query DevTools by setting `NODE_ENV=development`.

## Future Enhancements

Potential improvements for future versions:
1. **Real-time updates**: WebSocket integration
2. **Offline support**: React Query offline mutations
3. **Optimistic updates**: More granular optimistic updates
4. **Data synchronization**: Multi-user real-time sync
5. **Performance monitoring**: Query performance metrics

## Migration Checklist

- [ ] Install required dependencies
- [ ] Backup original `page.tsx`
- [ ] Copy all new files to correct locations
- [ ] Update imports if necessary
- [ ] Test all functionality
- [ ] Verify error handling
- [ ] Check responsive design
- [ ] Test on different devices
- [ ] Validate TypeScript compilation
- [ ] Run integration tests

## Support

For issues or questions regarding this refactor:
1. Check this README for common solutions
2. Review the TypeScript types for data structure requirements
3. Test with React Query DevTools for debugging
4. Verify all required dependencies are installed 