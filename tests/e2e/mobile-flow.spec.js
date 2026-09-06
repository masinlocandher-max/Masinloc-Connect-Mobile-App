import { test, expect } from '@playwright/test';

const dictionary = {
  columns: ['tina', 'pos', 'en', 'fil', 'pages'],
  entries: [
    ['abagat', 'noun', 'Rain', 'ulan', '1'],
    ['abay', 'noun', 'Escort', 'abay', '1'],
  ],
};

const marketplace = {
  categories: [{ id: 'food-drinks', label: 'Food & Drinks' }],
  businesses: [{
    slug: 'sample-cafe',
    name: 'Sample Cafe',
    category: 'food-drinks',
    location: 'Masinloc, Zambales',
    description: 'A reviewed local business used only by the automated smoke test.',
    descriptor: 'Cafe',
    facebook: 'https://www.facebook.com/',
  }],
};

const discover = { section: { name: 'Discover Masinloc', intro: 'Places, food, culture and stories from Masinloc.' }, themes: [], articles: [] };
const history = { sections: [{ slug: 'roots', number: '01', title: 'Masinloc Roots', public_copy: ['Verified history sample for smoke testing.'] }] };
const bulletin = { categories: [], articles: [] };

async function stubPublicData(page) {
  await page.route('**/data/sambal-tina.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(dictionary) }));
  await page.route('**/data/marketplace.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(marketplace) }));
  await page.route('**/data/marketplace-logos.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('**/data/discover.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(discover) }));
  await page.route('**/data/mabayani.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(history) }));
  await page.route('**/data/bulletin.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(bulletin) }));
  await page.route('**/rest/v1/external_jobs**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': '0-0/1' }, body: JSON.stringify([{ id: '11111111-1111-4111-8111-111111111111', provider_id: '22222222-2222-4222-8222-222222222222', title: 'Customer Service Representative', company: 'Sample Employer', location: 'Masinloc, Zambales', work_setup: 'On-site', employment_type: 'Full-time', salary_text: 'Competitive', published_at: new Date().toISOString(), closing_date: null, apply_url: 'https://example.com/apply', verification_status: 'verified' }]) }));
  await page.route('**/rest/v1/job_providers**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': '0-0/1' }, body: JSON.stringify([{ id: '22222222-2222-4222-8222-222222222222', name: 'Sample Provider', attribution_label: 'Trusted Job Provider', status: 'active' }]) }));
}

async function enterAsGuest(page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Masinloc, in your pocket.' })).toBeVisible();
  await page.getByRole('button', { name: 'Explore as guest' }).click();
  await expect(page.getByText('Sambal Tina', { exact: true }).first()).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await stubPublicData(page);
  await page.addInitScript(() => localStorage.clear());
});

test('first-run guest flow reaches the mobile home', async ({ page }) => {
  await enterAsGuest(page);
  await expect(page.getByText('Jobs & Opportunities', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Marketplace', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('More Services', { exact: true }).first()).toBeVisible();
});

test('Sambal Tina opens as a mobile-native dictionary', async ({ page }) => {
  await enterAsGuest(page);
  await page.getByText('Sambal Tina', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Sambal Tina' })).toBeVisible();
  await expect(page.getByPlaceholder(/Search a Tina word/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'abagat' })).toBeVisible();
});

test('Jobs opens, filters render, and trusted provider data appears', async ({ page }) => {
  await enterAsGuest(page);
  await page.getByText('Jobs & Opportunities', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Jobs & Opportunities' })).toBeVisible();
  await expect(page.getByPlaceholder(/Search jobs, companies, skills/)).toBeVisible();
  await expect(page.getByText('Customer Service Representative')).toBeVisible();
  await expect(page.getByText('Trusted Job Provider')).toBeVisible();
});

test('Marketplace and community contribution screens are reachable', async ({ page }) => {
  await enterAsGuest(page);
  await page.getByText('Marketplace', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Marketplace' })).toBeVisible();
  await expect(page.getByText('Sample Cafe')).toBeVisible();
  await page.getByRole('button', { name: 'Home' }).click();
  await page.getByText('More Services', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'More Services' })).toBeVisible();
  await page.getByText('Submit Masinloc History', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Submit Masinloc History' })).toBeVisible();
});
