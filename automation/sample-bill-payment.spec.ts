/**
 * Sample Cypress test (TypeScript-style pseudocode) for the BBPS bill
 * fetch-to-payment journey. All data below is DUMMY/SAMPLE data for
 * portfolio demonstration only — no real biller endpoints or credentials.
 */

describe('BBPS — Bill Fetch & Payment Flow', () => {
  const DUMMY_CONSUMER = {
    category: 'Electricity',
    consumerNumber: 'DEMO-CONSUMER-00123',
  };

  beforeEach(() => {
    cy.visit('/bill-payment');
  });

  it('lists all supported bill categories', () => {
    cy.get('[data-testid="bill-category-list"]').within(() => {
      cy.contains('Electricity').should('be.visible');
      cy.contains('Water').should('be.visible');
      cy.contains('Gas').should('be.visible');
      cy.contains('DTH').should('be.visible');
    });
  });

  it('fetches a bill amount for a valid dummy consumer number', () => {
    cy.intercept('POST', '/api/bbps/fetch', {
      statusCode: 200,
      body: { amount: 850, dueDate: '2026-08-01', status: 'FETCHED' },
    }).as('fetchBill');

    cy.contains(DUMMY_CONSUMER.category).click();
    cy.get('[data-testid="consumer-number"]').type(DUMMY_CONSUMER.consumerNumber);
    cy.get('[data-testid="fetch-bill-btn"]').click();

    cy.wait('@fetchBill');
    cy.get('[data-testid="fetched-amount"]').should('contain.text', '850');
  });

  it('shows a clear timeout error and does not display a stale amount', () => {
    cy.intercept('POST', '/api/bbps/fetch', { forceNetworkError: true }).as('fetchTimeout');

    cy.contains(DUMMY_CONSUMER.category).click();
    cy.get('[data-testid="consumer-number"]').type(DUMMY_CONSUMER.consumerNumber);
    cy.get('[data-testid="fetch-bill-btn"]').click();

    cy.wait('@fetchTimeout');
    cy.get('[data-testid="fetch-error"]').should('contain.text', 'timed out');
    cy.get('[data-testid="fetched-amount"]').should('not.exist');
  });

  it('blocks payment against a stale fetched amount', () => {
    cy.intercept('POST', '/api/bbps/fetch', {
      statusCode: 200,
      body: { amount: 850, dueDate: '2026-08-01', status: 'FETCHED', fetchedAt: Date.now() - 10 * 60 * 1000 },
    }).as('staleFetch');

    cy.contains(DUMMY_CONSUMER.category).click();
    cy.get('[data-testid="consumer-number"]').type(DUMMY_CONSUMER.consumerNumber);
    cy.get('[data-testid="fetch-bill-btn"]').click();
    cy.wait('@staleFetch');

    cy.get('[data-testid="pay-bill-btn"]').click();
    cy.get('[data-testid="stale-amount-warning"]').should('be.visible');
  });
});
