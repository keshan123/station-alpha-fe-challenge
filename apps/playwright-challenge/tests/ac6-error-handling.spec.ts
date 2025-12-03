import { test, expect } from '@playwright/test';

/**
 * Acceptance Criteria 6: Error Handling
 * 
 * - Mock the API to return an error response
 * - Verify the error modal appears with the correct error message
 * - Verify the user can dismiss the modal
 */
test('AC6: Verify error handling displays error modal and can be dismissed', async ({ page }) => {
  // STEP 1: Set up the API route mock BEFORE navigation
  // We'll mock the API to return an error response (500 status code)
  // This simulates a server error scenario
  await page.route('https://jsonplaceholder.typicode.com/users', async (route) => {
    // Return a 500 Internal Server Error response
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' })
    });
  });

  // STEP 2: Navigate to the application
  // The route mock is already set up, so when the app loads and makes the API call,
  // it will receive a 500 error response
  await page.goto('http://localhost:3677');

  // STEP 3: Wait for the loading spinner to disappear
  // The app will try to fetch users, encounter an error, and stop loading
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

  // STEP 4: Verify the error modal appears
  // When an error occurs, the App component sets the error state and displays ErrorModal
  const errorModal = page.locator('[data-testid="error-modal"]');
  await expect(errorModal).toBeVisible();
  
  // Verify the error modal overlay is also visible
  const errorModalOverlay = page.locator('[data-testid="error-modal-overlay"]');
  await expect(errorModalOverlay).toBeVisible();

  // STEP 5: Verify the error modal displays the correct error message
  // According to App.tsx, the error message is "Failed to load users. Please try again later."
  const errorMessage = page.locator('[data-testid="error-message"]');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText('Failed to load users. Please try again later.');

  // STEP 6: Verify the user can dismiss the modal using the close button (X)
  // The ErrorModal has a close button with data-testid="error-close-button"
  const closeButton = page.locator('[data-testid="error-close-button"]');
  await expect(closeButton).toBeVisible();
  
  // Click the close button
  await closeButton.click();
  
  // Verify the modal is dismissed (no longer visible)
  await expect(errorModal).not.toBeVisible();
  await expect(errorModalOverlay).not.toBeVisible();

  // STEP 7: Re-trigger the error to test the dismiss button
  // Reload the page to trigger the error again
  await page.reload();
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });
  
  // Verify the error modal appears again
  await expect(errorModal).toBeVisible();

  // STEP 8: Verify the user can dismiss the modal using the Dismiss button
  // The ErrorModal has a Dismiss button with data-testid="error-action-button"
  const dismissButton = page.locator('[data-testid="error-action-button"]');
  await expect(dismissButton).toBeVisible();
  await expect(dismissButton).toHaveText('Dismiss');
  
  // Click the dismiss button
  await dismissButton.click();
  
  // Verify the modal is dismissed (no longer visible)
  await expect(errorModal).not.toBeVisible();
  await expect(errorModalOverlay).not.toBeVisible();
});

