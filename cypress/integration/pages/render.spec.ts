import { beforeEach, cy, describe, it } from 'local-cypress';

describe('All Page', () => {
  beforeEach(() => {
    cy.window().then((win) =>
      win.localStorage.setItem('umami.disabled', 'true')
    );
  });

  it('should display index page', () => {
    cy.visit('/');
    cy.get('h1').should('contain', 'You can call me Jeff');
  });

  it('should display about page', () => {
    cy.visit('/about');
    cy.get('h1').should('contain', 'Jeff Fan');
  });

  it('should display blog page', () => {
    cy.visit('/blog');
    cy.get('h1').should('contain', 'Blog');
  });

  it('should display library page', () => {
    cy.visit('/library');
    cy.get('h1').should('contain', 'Library');
  });

  it('should display projects page', () => {
    cy.visit('/projects');
    cy.get('h1').should('contain', 'Projects');
  });

  it('should display subscribe page', () => {
    cy.visit('/subscribe');
    cy.get('h1').should('contain', 'Subscribe to se.isfusion.cloud');
  });

  it('should display trf page', () => {
    cy.visit('/trf');
    cy.get('h1').should('contain', 'Rekening BCA');
  });
});
