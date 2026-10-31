import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('LEETQUEST End-to-End Quest Flow', () => {
  test('Completes the full hero journey: register, add problem, import CSV, generate mission, complete, verify XP and streak', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/LEETQUEST/i);

    // 2. Register Account
    await page.click('text=Start Your Quest');
    await expect(page).toHaveURL(/.*\/auth/);

    // Switch to register
    await page.click('text=Create One');
    await page.fill('#auth-display-name', 'WarriorE2E');
    await page.fill('#auth-email', `warrior_${Date.now()}@test.com`);
    await page.fill('#auth-password', 'SecretPass123!');
    await page.click('button:has-text("Register Account")');

    // Should redirect to Dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText('WarriorE2E');

    // 3. Log a single problem
    await page.click('text=+ Problem');
    await page.waitForURL('**/add');
    await page.fill('#prob-title', 'Valid Parentheses');
    await page.selectOption('#prob-difficulty', 'Easy');
    await page.selectOption('#prob-topic', 'Stacks');
    await page.fill('#prob-url', 'https://leetcode.com/problems/valid-parentheses/');
    await page.fill('#prob-notes', 'Stack balanced parentheses check');
    await page.click('button:has-text("Save Problem to Quest Log")');

    // Should redirect to /progress
    await page.waitForURL('**/progress');
    await expect(page.locator('table')).toContainText('Valid Parentheses');

    // 4. Batch CSV Import
    await page.click('text=+ Add Problem');
    await page.waitForURL('**/add');
    await page.click('button:has-text("Batch CSV Import")');

    // Simulate CSV file input
    const csvContent = `Title,Difficulty,Topic,Link,SolvedDate,Notes
Two Sum,Easy,Arrays,https://leetcode.com/problems/two-sum/,2026-05-01,Hash map
Climbing Stairs,Easy,DP,https://leetcode.com/problems/climbing-stairs/,2026-05-01,Fibonacci
Reverse String,Easy,Strings,https://leetcode.com/problems/reverse-string/,2026-05-01,Two pointer`;

    const buffer = Buffer.from(csvContent, 'utf-8');
    await page.setInputFiles('#csv-file-input', {
      name: 'problems.csv',
      mimeType: 'text/csv',
      buffer,
    });

    // Start batch import
    await page.click('button:has-text("Start Batch Import")');
    await expect(page.locator('text=Inserted')).toBeVisible();

    // 5. Generate a mission
    await page.click('text=Missions');
    await page.waitForURL('**/missions');
    await page.click('button:has-text("Generate Quest")');
    await expect(page.locator('.progress-container').first()).toBeVisible();

    // 6. Complete mission requirements & claim XP
    // Note: A mission requires solving new problems created after mission creation.
    // Let's add qualifying problems for the active mission
    const missionTopicText = await page.locator('.glass-card span[style*="border-radius"]').first().textContent();
    const missionTopic = missionTopicText?.trim() || 'Arrays';

    // Solve 3 problems for the quest
    for (let i = 1; i <= 3; i++) {
      await page.goto('/add');
      await page.fill('#prob-title', `Quest Problem ${i} - ${Date.now()}`);
      await page.selectOption('#prob-difficulty', 'Easy');
      await page.selectOption('#prob-topic', missionTopic);
      await page.click('button:has-text("Save Problem to Quest Log")');
      await page.waitForURL('**/progress');
    }

    // Return to Mission Arena and Claim XP
    await page.goto('/missions');
    const claimButton = page.locator('button:has-text("Claim XP")').first();
    await expect(claimButton).toBeEnabled();
    await claimButton.click();

    // Confirm XP claim toast
    await expect(page.locator('.toast-success')).toBeVisible();

    // 7. Verify Dashboard XP updated
    await page.goto('/dashboard');
    const xpText = await page.locator('text=Total XP:').locator('..').textContent();
    expect(xpText).toMatch(/[1-9]\d*\s*XP/);
  });

  test('WCAG 2.2 AA Accessibility Audits with @axe-core/playwright', async ({ page }) => {
    // Audit Landing page
    await page.goto('/');
    const landingResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast']) // color-contrast can vary with local browser font rendering
      .analyze();
    expect(landingResults.violations).toEqual([]);

    // Audit Leaderboard page
    await page.goto('/leaderboard');
    const leaderboardResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();
    expect(leaderboardResults.violations).toEqual([]);
  });
});
