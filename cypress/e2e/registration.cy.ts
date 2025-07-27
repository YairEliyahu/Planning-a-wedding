describe('Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should successfully register a new user', () => {
    // Fill in the registration form
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check for success message
    cy.contains('ההרשמה הושלמה בהצלחה!').should('be.visible');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should show validation errors for empty fields', () => {
    // Submit empty form
    cy.get('button[type="submit"]').click();
    
    // Check for validation messages
    cy.contains('שם מלא הוא שדה חובה').should('be.visible');
    cy.contains('אימייל הוא שדה חובה').should('be.visible');
    cy.contains('סיסמה היא שדה חובה').should('be.visible');
  });

  it('should show error for invalid email format', () => {
    // Fill in form with invalid email
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('password123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check for email validation error
    cy.contains('כתובת אימייל לא תקינה').should('be.visible');
  });

  it('should show error for password too short', () => {
    // Fill in form with short password
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check for password validation error
    cy.contains('הסיסמה חייבת להכיל לפחות 6 תווים').should('be.visible');
  });
}); 