import { test, expect } from '@playwright/test';

/**
 * Acceptance Criteria 3: Display User Data
 * 
 * - Mock the API to return a list of users
 * - Verify the table correctly displays user data in each column
 * - Verify links in the website column point to the correct URL
 */
test('AC3: Verify user data displays correctly in table columns', async ({ page }) => {
  // STEP 1: Set up the API route mock BEFORE navigation
  // This is critical - the route must be set up before page.goto() so it can intercept
  // the API call that happens when the page loads
  await page.route('https://jsonplaceholder.typicode.com/users', async (route) => {
    // When the app makes a request to this URL, intercept it and return our mock data
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
          company: {
            name: "XYZ Inc",
            catchPhrase: "Innovation at its finest",
            bs: "cutting-edge technology"
          }
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
          company: null
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

  // STEP 5: Verify each user's data is displayed correctly
  // We'll loop through our mock users and verify each column
  // Note: The API service (api.ts) transforms the data - it sets company to null for even IDs
  // So user 2 (even ID) will have company: null even though we mocked it with a company
  
  // User 1 - odd ID, so company will be preserved
  const user1Row = page.locator('[data-testid="user-1"]');
  await expect(user1Row).toBeVisible();
  
  // Verify all columns for user 1
  await expect(page.locator('[data-testid="id-1"]')).toHaveText('1');
  await expect(page.locator('[data-testid="name-1"]')).toHaveText('John Doe');
  await expect(page.locator('[data-testid="username-1"]')).toHaveText('johndoe');
  await expect(page.locator('[data-testid="email-1"]')).toHaveText('john@example.com');
  await expect(page.locator('[data-testid="city-1"]')).toHaveText('New York');
  await expect(page.locator('[data-testid="phone-1"]')).toHaveText('555-123-4567');
  
  // Verify website link for user 1 - check the link text, href, target, and rel attributes
  const website1Cell = page.locator('[data-testid="website-1"]');
  const website1Link = website1Cell.locator('a');
  await expect(website1Link).toHaveText('johndoe.com');
  await expect(website1Link).toHaveAttribute('href', 'https://johndoe.com');
  await expect(website1Link).toHaveAttribute('target', '_blank');
  await expect(website1Link).toHaveAttribute('rel', 'noopener noreferrer');
  
  // Verify company for user 1 - should have company since ID is odd
  const company1Cell = page.locator('[data-testid="company-1"]');
  await expect(company1Cell.locator('span.company-name')).toHaveText('ABC Corp');

  // User 2 - even ID, so API service will set company to null
  const user2Row = page.locator('[data-testid="user-2"]');
  await expect(user2Row).toBeVisible();
  
  // Verify all columns for user 2
  await expect(page.locator('[data-testid="id-2"]')).toHaveText('2');
  await expect(page.locator('[data-testid="name-2"]')).toHaveText('Jane Smith');
  await expect(page.locator('[data-testid="username-2"]')).toHaveText('janesmith');
  await expect(page.locator('[data-testid="email-2"]')).toHaveText('jane@example.com');
  await expect(page.locator('[data-testid="city-2"]')).toHaveText('Los Angeles');
  await expect(page.locator('[data-testid="phone-2"]')).toHaveText('555-987-6543');
  
  // Verify website link for user 2
  const website2Cell = page.locator('[data-testid="website-2"]');
  const website2Link = website2Cell.locator('a');
  await expect(website2Link).toHaveText('janesmith.org');
  await expect(website2Link).toHaveAttribute('href', 'https://janesmith.org');
  await expect(website2Link).toHaveAttribute('target', '_blank');
  await expect(website2Link).toHaveAttribute('rel', 'noopener noreferrer');
  
  // Verify company for user 2 - should be null (no company-name span, shows NoCompanyIcon)
  const company2Cell = page.locator('[data-testid="company-2"]');
  await expect(company2Cell.locator('span.company-name')).not.toBeVisible();

  // User 3 - odd ID, but we mocked it with company: null
  const user3Row = page.locator('[data-testid="user-3"]');
  await expect(user3Row).toBeVisible();
  
  // Verify all columns for user 3
  await expect(page.locator('[data-testid="id-3"]')).toHaveText('3');
  await expect(page.locator('[data-testid="name-3"]')).toHaveText('Bob Johnson');
  await expect(page.locator('[data-testid="username-3"]')).toHaveText('bobjohnson');
  await expect(page.locator('[data-testid="email-3"]')).toHaveText('bob@example.com');
  await expect(page.locator('[data-testid="city-3"]')).toHaveText('Chicago');
  await expect(page.locator('[data-testid="phone-3"]')).toHaveText('555-456-7890');
  
  // Verify website link for user 3
  const website3Cell = page.locator('[data-testid="website-3"]');
  const website3Link = website3Cell.locator('a');
  await expect(website3Link).toHaveText('bobjohnson.net');
  await expect(website3Link).toHaveAttribute('href', 'https://bobjohnson.net');
  await expect(website3Link).toHaveAttribute('target', '_blank');
  await expect(website3Link).toHaveAttribute('rel', 'noopener noreferrer');
  
  // Verify company for user 3 - should be null (we mocked it as null)
  const company3Cell = page.locator('[data-testid="company-3"]');
  await expect(company3Cell.locator('span.company-name')).not.toBeVisible();
});
