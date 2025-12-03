import { test, expect } from '@playwright/test';

/**
 * Acceptance Criteria 5: Company Display
 * 
 * - Verify users with a company display the company name
 * - Verify users without a company display the cross SVG icon
 * - Validate the presence of the cross SVG icon by checking the data-testid="no-company-icon" attribute
 */
test('AC5: Verify company display for users with and without companies', async ({ page }) => {
  // STEP 1: Set up the API route mock BEFORE navigation
  // We'll create a mix of users: some with companies, some without
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
        },
        {
          id: 2,
          name: "Jane Smith",
          username: "janesmith",
          email: "jane@example.com",
          address: {
            street: "Oak Ave",
            suite: "Suite 456",
            city: "Los Angeles",
            zipcode: "90001",
            geo: {
              lat: "34.0522",
              lng: "-118.2437"
            }
          },
          phone: "555-987-6543",
          website: "janesmith.org",
          company: null
        },
        {
          id: 3,
          name: "Bob Johnson",
          username: "bobjohnson",
          email: "bob@example.com",
          address: {
            street: "Elm Street",
            suite: "Apt 789",
            city: "Chicago",
            zipcode: "60601",
            geo: {
              lat: "41.8781",
              lng: "-87.6298"
            }
          },
          phone: "555-456-7890",
          website: "bobjohnson.net",
          company: {
            name: "XYZ Inc",
            catchPhrase: "Innovation at its finest",
            bs: "cutting-edge technology"
          }
        }
      ])
    });
  });

  // STEP 2: Navigate to the application
  // The route mock is already set up, so when the app loads and makes the API call,
  // it will be intercepted by our mock
  await page.goto('http://localhost:3677');

  // STEP 3: Wait for the loading spinner to disappear
  // This ensures the API call has completed and the data has been rendered
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

  // STEP 4: Verify the user table is visible
  const userTable = page.locator('[data-testid="user-table"]');
  await expect(userTable).toBeVisible();

  // STEP 5: Verify users WITH a company display the company name
  // User 1 has a company, and since ID is odd, the API service will preserve it
  const company1Cell = page.locator('[data-testid="company-1"]');
  await expect(company1Cell).toBeVisible();
  
  // Verify the company name is displayed in a span with class "company-name"
  const company1Name = company1Cell.locator('span.company-name');
  await expect(company1Name).toBeVisible();
  await expect(company1Name).toHaveText('ABC Corp');
  
  // Verify the NoCompanyIcon is NOT present for users with a company
  await expect(company1Cell.locator('[data-testid="no-company-icon"]')).not.toBeVisible();

  // User 3 has a company, and since ID is odd, the API service will preserve it
  const company3Cell = page.locator('[data-testid="company-3"]');
  await expect(company3Cell).toBeVisible();
  
  // Verify the company name is displayed
  const company3Name = company3Cell.locator('span.company-name');
  await expect(company3Name).toBeVisible();
  await expect(company3Name).toHaveText('XYZ Inc');
  
  // Verify the NoCompanyIcon is NOT present
  await expect(company3Cell.locator('[data-testid="no-company-icon"]')).not.toBeVisible();

  // STEP 6: Verify users WITHOUT a company display the cross SVG icon
  // User 2 has company: null, and since ID is even, the API service will also set it to null
  const company2Cell = page.locator('[data-testid="company-2"]');
  await expect(company2Cell).toBeVisible();
  
  // Verify the NoCompanyIcon is present with the correct data-testid
  const noCompanyIcon2 = company2Cell.locator('[data-testid="no-company-icon"]');
  await expect(noCompanyIcon2).toBeVisible();
  
  // Verify the company name span is NOT present for users without a company
  await expect(company2Cell.locator('span.company-name')).not.toBeVisible();
  
  // Verify the icon contains an SVG element (the cross icon)
  const svgIcon = noCompanyIcon2.locator('svg');
  await expect(svgIcon).toBeVisible();
});

