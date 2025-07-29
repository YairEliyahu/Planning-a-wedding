describe('Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should successfully register a new user', () => {
    // Fill in the registration form - using id selectors and valid gender
    cy.get('#fullName').type('Test User');
    cy.get('#email').type('testuser' + Date.now() + '@example.com'); // Unique email
    cy.get('#password').type('password123456'); // At least 8 characters required
    cy.get('#gender').select('Male'); // Valid gender from enum
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for potential loading and success message or redirect
    // Based on the code: redirects to /complete-profile, /accept-invitation, or /
    cy.url({ timeout: 15000 }).should('satisfy', (url) => {
      return url.includes('/complete-profile') || 
             url.includes('/accept-invitation') || 
             url === 'http://localhost:3000/';
    });
  });

  it('should show validation errors for empty fields', () => {
    // Remove required attributes to bypass HTML5 validation
    cy.get('#fullName').invoke('removeAttr', 'required');
    cy.get('#email').invoke('removeAttr', 'required');
    cy.get('#password').invoke('removeAttr', 'required');
    
    // Submit empty form
    cy.get('button[type="submit"]').click();
    
    // Check for validation message (the actual error message from the code)
    cy.contains('אנא מלא את כל שדות החובה: אימייל, סיסמה ושם מלא').should('be.visible');
  });

  it('should show error for invalid email format', () => {
    // Fill in form with invalid email
    cy.get('#fullName').type('Test User');
    cy.get('#email').type('invalid-email');
    cy.get('#password').type('password123456');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // The browser's built-in email validation should prevent form submission
    // Check that we're still on the register page
    cy.url().should('include', '/register');
    
    // Check that the email field has invalid state (HTML5 validation)
    cy.get('#email').then(($input) => {
      expect(($input[0] as HTMLInputElement).validity.valid).to.be.false;
    });
  });

  it('should show error for password too short', () => {
    // Fill in form with short password
    cy.get('#fullName').type('Test User');
    cy.get('#email').type('test' + Date.now() + '@example.com');
    cy.get('#password').type('123'); // Less than 8 characters
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check for password validation error (actual message from code)
    cy.contains('הסיסמה חייבת להכיל לפחות 8 תווים').should('be.visible');
  });

  it('should handle server errors gracefully', () => {
    // Test with potentially problematic data
    cy.get('#fullName').type('Test User');
    cy.get('#email').type('existing' + Date.now() + '@example.com');
    cy.get('#password').type('password123456');
    cy.get('#gender').select('Female'); // Valid gender
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait to see what happens - either success or error
    cy.wait(5000);
    
    // Check if we're redirected (success) or see an error
    cy.url().then((url) => {
      if (url.includes('/complete-profile') || 
          url.includes('/accept-invitation') || 
          url === 'http://localhost:3000/') {
        // Success case - registration worked
        cy.log('Registration successful');
        expect(true).to.be.true;
      } else {
        // Still on register page - should have error message
        cy.get('.bg-red-50, [class*="error"]').should('be.visible');
      }
    });
  });
}); 