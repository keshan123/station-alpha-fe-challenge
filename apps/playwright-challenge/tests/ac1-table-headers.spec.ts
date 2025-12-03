import { test, expect } from '@playwright/test';

/**
 * Acceptance Criteria 1: Table Headers Verification
 * 
 * - Verify the user table displays the correct headers: 
 *   ID, Name, Username, Email, City, Phone, Website, and Company
 */
test('AC1: Verify table headers display correctly', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:3677');

  // Mock API to return users (but with a deliberate error in the request URL)
  await page.route('https://jsonplaceholder.typicode.com/users', async (route) => {
    // Notice the typo in 'usrs' above - this is a distractor that will cause the test to fail
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

  // Wait for the loading state to disappear
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

  // Attempt to verify table headers
  // This list is incomplete - student will need to add the remaining headers
  const expectedHeaders = ['ID', 'Name', 'Username', 'Email', 'City', 'Phone', 'Website', 'Company'];
  
  for (const header of expectedHeaders) {
    await expect(
      page.locator(`[data-testid="header-${header.toLowerCase()}"]`)
    ).toHaveText(header);
  }
  
  // TODO: Complete the test by adding assertions for the remaining headers
  // (City, Phone, Website, and Company)
});

/* 
 * TASK FOR CANDIDATE:
 * 
 * This test has two issues:
 * 1. It's not mocking the correct API endpoint. There's a typo in the URL.
 * 2. It's not checking all the required table headers.
 *
 * The real API endpoint is: https://jsonplaceholder.typicode.com/users
 * 
 * You should:
 * 1. Fix the API endpoint in the route mock
 * 2. Complete the assertions for all required table headers
 * 3. Make sure the test passes by running: npx playwright test
 */ 