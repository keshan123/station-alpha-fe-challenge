import { test, expect } from '@playwright/test';

/**
 * Acceptance Criteria 1: Table Headers Verification
 * 
 * - Verify the user table displays the correct headers: 
 *   ID, Name, Username, Email, City, Phone, Website, and Company
 */
test('AC1: Verify table headers display correctly', async ({ page }) => {
  // STEP 1: Set up the API route mock BEFORE navigation
  // This is critical - the route must be set up before page.goto() so it can intercept
  // the API call that happens when the page loads
  await page.route('https://jsonplaceholder.typicode.com/users', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          name: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          address: {
            street: "Main St",
            suite: "Apt 123",
            city: "New York",
            zipcode: "10001",
            geo: {
              lat: "40.7128",
              lng: "-74.0060"
            }
          },
          phone: "555-123-4567",
          website: "johndoe.com",
          company: {
            name: "ABC Corp",
            catchPhrase: "Making things happen",
            bs: "innovative solutions"
          }
        }
      ])
    });
  });

  // STEP 2: Navigate to the application
  // The route mock is already set up, so when the app loads and makes the API call,
  // it will be intercepted by our mock
  await page.goto('http://localhost:3677');

  // STEP 3: Wait for the loading state to disappear
  // This ensures the API call has completed and the data has been rendered
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

  // STEP 4: Verify all table headers are displayed correctly
  // The table should display all 8 required headers: ID, Name, Username, Email, City, Phone, Website, and Company
  const expectedHeaders = ['ID', 'Name', 'Username', 'Email', 'City', 'Phone', 'Website', 'Company'];
  
  for (const header of expectedHeaders) {
    await expect(
      page.locator(`[data-testid="header-${header.toLowerCase()}"]`)
    ).toHaveText(header);
  }
}); 