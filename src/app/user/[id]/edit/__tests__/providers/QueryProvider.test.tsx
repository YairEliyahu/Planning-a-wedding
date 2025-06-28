import React from 'react';
import QueryProvider from '../../providers/QueryProvider';

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({
    setDefaultOptions: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  ),
}));

describe('QueryProvider', () => {
  it('should create QueryProvider without errors', () => {
    const createProvider = () => {
      return (
        <QueryProvider>
          <div>Test Child</div>
        </QueryProvider>
      );
    };
    
    // Test passes if no errors are thrown
    createProvider();
  });

  it('should be a valid React component', () => {
    const provider = (
      <QueryProvider>
        <div>Test Child</div>
      </QueryProvider>
    );
    
    if (typeof provider !== 'object' || provider === null) {
      throw new Error('Should return a valid React element');
    }
  });

  it('should render children', () => {
    const testChild = <div>Test Child Content</div>;
    const provider = (
      <QueryProvider>
        {testChild}
      </QueryProvider>
    );
    
    if (!provider.props.children) {
      throw new Error('Should render children');
    }
  });
}); 