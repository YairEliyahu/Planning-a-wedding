import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup mock server for tests
export const server = setupServer(...handlers);

// Setup server for all tests
global.beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
global.afterEach(() => {
  server.resetHandlers();
});

// Cleanup after all tests
global.afterAll(() => {
  server.close();
}); 