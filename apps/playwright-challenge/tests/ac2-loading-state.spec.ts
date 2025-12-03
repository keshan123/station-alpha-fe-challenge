import { test, expect } from '@playwright/test';

/**
 * Acceptance Criteria 2: Loading State
 * 
 * - Verify the application shows a loading state while fetching data
 * - Verify the loading state is replaced by the user table once data is loaded
 */
test('AC2: Verify loading state displays and is replaced by user table', async ({ page }) => {
  // STEP 1: Set up the API route mock BEFORE navigation
  // This is critical - the route must be set up before page.goto() so it can intercept
  // the API call that happens when the page loads
  // Mock API to return users with a delay to ensure loading state is visible
  await page.route('https://jsonplaceholder.typicode.com/users', async (route) => {
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
  // it will be intercepted by our mock (with a delay to ensure loading state is visible)
  await page.goto('http://localhost:3677');

  // STEP 3: Verify the loading state is visible initially
  const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  await expect(loadingSpinner).toBeVisible();
  await expect(loadingSpinner).toHaveText('Loading users...');

  // STEP 4: Wait for the loading state to disappear
  // The delay in the route mock ensures the loading state is visible before the response
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

  // STEP 5: Verify the loading state is no longer visible
  await expect(loadingSpinner).not.toBeVisible();

  // STEP 6: Verify the user table is now visible
  // After loading completes, the table should be displayed with the user data
  const userTable = page.locator('[data-testid="user-table"]');
  await expect(userTable).toBeVisible();
  
  // STEP 7: Verify the user table contains the expected content
  await expect(userTable.locator('h2')).toHaveText('User Directory');
});

