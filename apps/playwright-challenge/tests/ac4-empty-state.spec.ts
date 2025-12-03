import { test, expect } from '@playwright/test';

/**
 * Acceptance Criteria 4: Empty State
 * 
 * - Mock the API to return an empty array
 * - Verify the application displays a "No users found" message
 */
test('AC4: Verify empty state displays when no users are returned', async ({ page }) => {
  // STEP 1: Set up the API route mock BEFORE navigation
  // This intercepts the API call and returns an empty array instead of user data
  await page.route('https://jsonplaceholder.typicode.com/users', async (route) => {
    // Return an empty array to simulate the API returning no users
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  // STEP 2: Navigate to the application
  // The route mock is already set up, so when the app loads and makes the API call,
  // it will receive an empty array
  await page.goto('http://localhost:3677');

  // STEP 3: Wait for the loading spinner to disappear
  // This ensures the API call has completed and the empty state has been rendered
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

  // STEP 4: Verify the user table container is visible
  // Even when there are no users, the table container should still be present
  const userTable = page.locator('[data-testid="user-table"]');
  await expect(userTable).toBeVisible();

  // STEP 5: Verify the "No users found" message is displayed
  // When users.length === 0, the UserTable component shows a div with data-testid="no-users"
  // containing the text "No users found."
  const noUsersMessage = page.locator('[data-testid="no-users"]');
  await expect(noUsersMessage).toBeVisible();
  await expect(noUsersMessage).toHaveText('No users found.');

  // STEP 6: Verify that the actual table is NOT displayed
  // When there are no users, the table element should not be present
  // We can verify this by checking that table headers are not visible
  const tableHeader = page.locator('[data-testid="header-id"]');
  await expect(tableHeader).not.toBeVisible();
});

