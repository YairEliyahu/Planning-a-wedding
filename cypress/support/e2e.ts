// cypress/support/e2e.ts

// Import commands.ts using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom commands TypeScript definitions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to register a new user
       * @example cy.register({ fullName: 'Test User', email: 'test@example.com', password: 'password123' })
       */
      register(userData: {
        fullName: string;
        email: string;
        password: string;
        age?: string;
        gender?: string;
      }): Chainable<void>;
      
      /**
       * Custom command to clear all session data
       * @example cy.cleanupSession()
       */
      cleanupSession(): Chainable<void>;
    }
  }
}
