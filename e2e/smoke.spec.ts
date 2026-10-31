import { test, expect } from '@playwright/test';

test('Smoke Test: Register, add problem, verify on dashboard', async ({ page }) => {
  // 1. Open App
  await page.goto('http://localhost:8080/');
  console.log('[SMOKE TEST] Navigated to http://localhost:8080/');
  await expect(page).toHaveTitle(/LEETQUEST/i);

  // 2. Register Account
  await page.click('text=Start Your Quest');
  await page.waitForURL('**/auth');
  await page.click('text=Create One');

  const testEmail = `hero_${Date.now()}@leetquest.dev`;
  await page.fill('#auth-display-name', 'SmokeHero');
  await page.fill('#auth-email', testEmail);
  await page.fill('#auth-password', 'HeroPassword123!');
  await page.click('button:has-text("Register Account")');
  console.log(`[SMOKE TEST] Registered user: ${testEmail}`);

  // 3. Confirm Dashboard loads
  await page.waitForURL('**/dashboard');
  await expect(page.locator('h1')).toContainText('SmokeHero');
  console.log('[SMOKE TEST] Dashboard loaded for SmokeHero');

  // 4. Add Problem
  await page.click('text=+ Problem');
  await page.waitForURL('**/add');
  await page.fill('#prob-title', 'Two Sum');
  await page.selectOption('#prob-difficulty', 'Easy');
  await page.selectOption('#prob-topic', 'Arrays');
  await page.fill('#prob-url', 'https://leetcode.com/problems/two-sum/');
  await page.fill('#prob-notes', 'One-pass hash table approach');
  await page.click('button:has-text("Save Problem to Quest Log")');
  console.log('[SMOKE TEST] Submitted problem: Two Sum');

  // 5. Verify on /progress
  await page.waitForURL('**/progress');
  await expect(page.locator('table')).toContainText('Two Sum');
  console.log('[SMOKE TEST] Problem verified in /progress table');

  // 6. Return to Dashboard and confirm stat update
  await page.click('text=Dashboard');
  await page.waitForURL('**/dashboard');
  await expect(page.locator('.badge-easy')).toContainText('1 Easy');
  console.log('[SMOKE TEST] Verified on Dashboard: 1 Easy problem logged!');
});
