import { test, expect } from '@playwright/test';

test.describe('Notion Lite Workspace E2E Journeys', () => {
  test('should complete the entire note lifecycle (register, login, create, edit, tag, search, archive, restore, and delete permanently)', async ({ page }) => {
    const timestamp = Date.now();
    const username = `e2e_user_${timestamp}`;
    const email = `e2e_${timestamp}@example.com`;
    const password = 'e2e_password_123';
    const noteTitle = `E2E Test Note ${timestamp}`;
    const noteContent = `# E2E Test Note\n\nThis note is created and updated by Playwright E2E automated suite.\n\n- [x] Create E2E test\n- [ ] Run other tests\n\n/quote`;

    // 1. Navigation & Registration
    await page.goto('/register');
    await expect(page).toHaveTitle(/Notion Lite/i);

    await page.fill('#username-input', username);
    await page.fill('#email-input', email);
    await page.fill('#password-input', password);
    await page.fill('#confirm-password-input', password);
    await page.click('button[type="submit"]');

    // 2. Wait for redirect to Workspace page (showing Sidebar tree and private pages)
    await expect(page.locator('text=Private Pages')).toBeVisible({ timeout: 10000 });

    // 3. Create Note Page
    await page.click('button[title="Create a new root page"]');

    // 4. Verify editor canvas is visible
    const titleInput = page.locator('input[placeholder="Untitled"]');
    await expect(titleInput).toBeVisible({ timeout: 10000 });

    // Fill Title
    await titleInput.click();
    await titleInput.fill(noteTitle);
    await titleInput.press('Enter'); // Triggers blur/save

    // Fill Editor Content
    const textarea = page.locator('textarea[placeholder*="Start writing"]');
    await textarea.click();
    await textarea.fill(noteContent);

    // Dismiss Slash Menu if open
    await page.keyboard.press('Escape');

    // Wait for auto-save to complete ("All changes saved" indicator)
    await expect(page.locator('text=All changes saved')).toBeVisible({ timeout: 15000 });

    // 5. Custom Tag Management
    // Open tag selector popover
    await page.click('button[title="Manage tags"]');
    const tagPopoverInput = page.locator('input[placeholder="Search or create tag..."]');
    await expect(tagPopoverInput).toBeVisible();

    // Create a new tag "E2ETag"
    const tagName = `E2E_${timestamp}`;
    await tagPopoverInput.fill(tagName);
    await page.click(`text=Create new tag:`);

    // Verify tag badge is rendered under the page title
    await expect(page.locator('[data-testid="tag-selector-container"]').locator(`text=${tagName}`)).toBeVisible();

    // 6. Omnibar Search Palette (Ctrl+K)
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('input[placeholder="Search note titles or content..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(noteTitle);

    // Click the search result to select it
    const searchResult = page.locator('.search-result-item').first();
    await expect(searchResult).toBeVisible();
    await searchResult.click();

    // Verify page is still active
    await expect(page.locator(`input[value="${noteTitle}"]`)).toBeVisible();

    // 7. Archive Page via Sidebar Node Row hover
    const pageNodeRow = page.locator('.sidebar-node-row', { hasText: noteTitle });
    await expect(pageNodeRow).toBeVisible();
    await pageNodeRow.hover();

    const archiveBtn = pageNodeRow.locator('button[title="Archive page"]');
    await expect(archiveBtn).toBeVisible();
    await archiveBtn.click();

    // Verify the node row is no longer in the active tree
    await expect(pageNodeRow).not.toBeVisible();

    // 8. Restore from Trash Bin Popover
    await page.click('[data-testid="trash-trigger-btn"]');
    const trashBin = page.locator('[data-testid="trash-bin-popover"]');
    await expect(trashBin).toBeVisible();

    // Filter trash bin items
    await trashBin.locator('input[placeholder="Filter by title..."]').fill(noteTitle);
    
    // Find the item, hover it, and click Restore
    const trashItem = trashBin.locator('div', { hasText: noteTitle }).first();
    await expect(trashItem).toBeVisible();
    await trashItem.hover();
    await trashItem.locator('button[title="Restore note"]').click();

    // Verify it's back in the active page tree sidebar
    await expect(page.locator('.sidebar-node-row', { hasText: noteTitle })).toBeVisible();

    // 9. Permanent Deletion from Trash Bin
    // Archive again
    const restoredRow = page.locator('.sidebar-node-row', { hasText: noteTitle });
    await restoredRow.hover();
    await restoredRow.locator('button[title="Archive page"]').click();
    await expect(restoredRow).not.toBeVisible();

    // Open trash bin again
    await page.click('[data-testid="trash-trigger-btn"]');
    await trashBin.locator('input[placeholder="Filter by title..."]').fill(noteTitle);

    // Setup window dialog handler to confirm permanent delete
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to permanently delete');
      await dialog.accept();
    });

    // Hover and delete permanently
    const trashItemToDelete = trashBin.locator('div', { hasText: noteTitle }).first();
    await expect(trashItemToDelete).toBeVisible();
    await trashItemToDelete.hover();
    await trashItemToDelete.locator('button[title="Delete permanently"]').click();

    // Verify it is gone from the trash bin
    await expect(trashBin.locator(`text=${noteTitle}`)).not.toBeVisible();
  });
});
