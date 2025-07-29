// cypress/support/commands.ts

/// <reference types="cypress" />
// ***********************************************
// Custom commands for Wedding Planning App
// ***********************************************

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for redirect to user dashboard
  cy.url().should('include', '/user/', { timeout: 10000 });
});

// Custom command for registration
Cypress.Commands.add('register', (userData: {
  fullName: string;
  email: string;
  password: string;
  age?: string;
  gender?: string;
}) => {
  cy.visit('/register');
  
  cy.get('#fullName').type(userData.fullName);
  cy.get('#email').type(userData.email);
  cy.get('#password').type(userData.password);
  
  if (userData.age) {
    cy.get('#age').type(userData.age);
  }
  
  if (userData.gender) {
    cy.get('#gender').select(userData.gender);
  }
  
  cy.get('button[type="submit"]').click();
});

// Custom command to clear local storage and cookies
Cypress.Commands.add('cleanupSession', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

export {};
