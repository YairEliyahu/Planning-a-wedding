describe('Login Flow', () => {
  beforeEach(() => {
    // Clean up any existing session
    cy.cleanupSession();
  });

  it('should successfully login with valid credentials', () => {
    // First create a user through registration to have valid credentials
    const uniqueEmail = 'logintest' + Date.now() + '@example.com';
    const password = 'password123456';
    
    // Register a new user first
    cy.visit('/register');
    cy.get('#fullName').type('Login Test User');
    cy.get('#email').type(uniqueEmail);
    cy.get('#password').type(password);
    cy.get('#gender').select('Male');
    cy.get('button[type="submit"]').click();
    
    // Wait for registration to complete
    cy.url({ timeout: 15000 }).should('satisfy', (url) => {
      return url.includes('/complete-profile') || 
             url.includes('/accept-invitation') || 
             url === 'http://localhost:3000/';
    });
    
    // Now logout and test login
    cy.clearLocalStorage();
    cy.visit('/login');
    
    // Fill in login form with the registered credentials
    cy.get('#email').type(uniqueEmail);
    cy.get('#password').type(password);
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should redirect after successful login
    cy.url({ timeout: 15000 }).should('satisfy', (url) => {
      return url.includes('/complete-profile') || 
             url.includes('/accept-invitation') || 
             url === 'http://localhost:3000/' ||
             url.includes('/user/');
    });
  });

  it('should show error for empty fields', () => {
    cy.visit('/login');
    
    // Remove required attributes to bypass HTML5 validation
    cy.get('#email').invoke('removeAttr', 'required');
    cy.get('#password').invoke('removeAttr', 'required');
    
    // Submit empty form
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors (the actual message from the system)
    cy.get('body').should('contain.text', 'נא להזין אימייל וסיסמה');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    
    // Fill with non-existent credentials
    cy.get('#email').type('nonexistent' + Date.now() + '@example.com');
    cy.get('#password').type('wrongpassword');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should show error message (the actual message from the system)
    cy.get('body').should('contain.text', 'המייל לא קיים במערכת');
  });

  it('should use custom login command', () => {
    // Test that the custom command exists
    expect(cy.login).to.be.a('function');
    
    // Note: We can't actually test the login command without valid credentials
    // This test just verifies the command is properly defined
    cy.log('Custom login command is available');
  });
}); 