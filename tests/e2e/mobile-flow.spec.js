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
  businesses: [{ slug: 'sample-cafe', name: 'Sample Cafe', category: 'food-drinks', location: 'Masinloc, Zambales', description: 'A reviewed local business used only by the automated smoke test.', descriptor: 'Cafe', facebook: 'https://www.facebook.com/' }],
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
  await page.route('**/rest/v1/external_jobs**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': '0-0/1' }, body: JSON.stringify([{ id: '11111111-1111-4111-8111-111111111111', provider_id: '22222222-2222-4222-8222-222222222222', title: 'Customer Service Representative', company: 'Sample Employer', location: 'Masinloc, Zambales', work_setup: 'On-site', employment_type: 'Full-time', salary_text: 'Competitive', published_at: new Date().toISOString(), closing_date: null, apply_url: 'https://example.com/apply', verification_status: 'live' }]) }));
  await page.route('**/rest/v1/job_providers**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': '0-0/1' }, body: JSON.stringify([{ id: '22222222-2222-4222-8222-222222222222', name: 'Sample Provider', attribution_label: 'Trusted Job Provider', status: 'testing' }]) }));
  await page.route('**/functions/v1/emergency-response', async (route) => {
    const request = route.request();
    const payload = request.postDataJSON();
    if (payload?.action === 'status') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok:true, incident:{ status:'received', public_reference:'MC-TEST-001', received_at:'2026-09-13T11:00:00Z' }, messages:[] }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok:true, status:'received', reference:'MC-TEST-001', received_at:'2026-09-13T11:00:00Z' }) });
  });
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

test('first-run guest flow reaches the mobile home', async ({ page }, testInfo) => {
  await enterAsGuest(page);
  await expect(page.getByText('Jobs & Opportunities', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Marketplace', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('For Business Owners', { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: false });
});

test('Sambal Tina opens as a mobile-native dictionary', async ({ page }, testInfo) => {
  await enterAsGuest(page);
  await page.getByText('Sambal Tina', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Sambal Tina' })).toBeVisible();
  await expect(page.getByPlaceholder(/Search a Tina word/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'abagat' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Hear abagat/i })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('dictionary.png'), fullPage: false });
});

test('Jobs opens, filters render, and trusted provider data appears', async ({ page }, testInfo) => {
  await enterAsGuest(page);
  await page.getByText('Jobs & Opportunities', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Jobs & Opportunities' })).toBeVisible();
  await expect(page.getByPlaceholder(/Search jobs, companies, skills/)).toBeVisible();
  await expect(page.getByText('Customer Service Representative')).toBeVisible();
  await expect(page.getByText('Trusted Job Provider')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('jobs.png'), fullPage: false });
});

test('Marketplace and community contribution screens are reachable', async ({ page }, testInfo) => {
  await enterAsGuest(page);
  await page.getByText('Marketplace', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Marketplace' })).toBeVisible();
  await expect(page.getByText('Sample Cafe')).toBeVisible();
  await page.getByLabel('Home', { exact: true }).click();
  await page.getByText('More Services', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'More Services' })).toBeVisible();
  await page.getByText('Submit Masinloc History', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Submit Masinloc History' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('contribution.png'), fullPage: false });
});

test('guest Saved screen remains usable without forced sign-in', async ({ page }, testInfo) => {
  await enterAsGuest(page);
  await page.getByRole('button', { name: 'Saved', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Saved' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Device saves are available without an account' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('saved-guest.png'), fullPage: false });
});

test('business-owner flow does not expose unfinished POS or order controls', async ({ page }, testInfo) => {
  await enterAsGuest(page);
  await page.getByText('For Business Owners', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'For Business Owners' })).toBeVisible();
  await expect(page.getByText('Masinloc POS is a separate product')).toBeVisible();
  await expect(page.getByText('Marketplace Orders', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Access Masinloc POS', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: /Add My Business to Marketplace/i }).click();
  await expect(page.getByRole('heading', { name: 'Add Your Business' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('business-owner.png'), fullPage: false });
});

test('Help Desk minimizes sensitive device data after confirmed delivery', async ({ page }, testInfo) => {
  await enterAsGuest(page);
  await page.getByText('Help Desk', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Help Desk' })).toBeVisible();
  await page.getByRole('button', { name: /PNP Police and public safety/i }).click();
  await page.getByLabel('Incident type').selectOption('crime');
  await page.getByLabel('What is happening?').fill('Smoke-test incident details that should not remain after delivery.');
  await page.getByLabel('Barangay').fill('North Poblacion');
  await page.getByText('Optional contact details').click();
  await page.getByLabel('Name', { exact:true }).fill('Private Reporter');
  await page.getByLabel('Phone or email').fill('09170000000');
  await page.getByRole('button', { name: 'Send report' }).click();
  await expect(page.getByText('MC-TEST-001')).toBeVisible();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('masinloc-connect-active-report-v2')));
  expect(stored.sync_state).toBe('delivered');
  expect(stored.status).toBe('received');
  expect(stored.reference).toBe('MC-TEST-001');
  expect(stored.location_summary).toBe('North Poblacion');
  expect(stored.report_secret).toBeTruthy();
  expect(stored.description).toBeUndefined();
  expect(stored.reporter_name).toBeUndefined();
  expect(stored.reporter_contact).toBeUndefined();
  expect(stored.barangay).toBeUndefined();
  expect(stored.latitude).toBeUndefined();
  expect(stored.longitude).toBeUndefined();
  await page.screenshot({ path: testInfo.outputPath('helpdesk-delivered.png'), fullPage: false });
});

test('Help Desk recovers an interrupted send as queued for retry', async ({ page }) => {
  await enterAsGuest(page);
  await page.evaluate(() => {
    localStorage.setItem('masinloc-connect-active-report-v2', JSON.stringify({
      client_report_id:'interrupted-report',
      report_secret:'interrupted-secret',
      target_agency:'pnp',
      report_mode:'emergency',
      incident_type:'crime',
      description:'This payload must remain until delivery succeeds.',
      barangay:'North Poblacion',
      sync_state:'sending',
      status:'sending',
      updated_local_at:new Date().toISOString(),
    }));
  });
  await page.getByText('Help Desk', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Your Help Desk Report' })).toBeVisible();
  await expect(page.getByText('Saved offline · not yet received')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry sending' })).toBeVisible();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('masinloc-connect-active-report-v2')));
  expect(stored.sync_state).toBe('queued');
  expect(stored.status).toBe('saved_offline');
  expect(stored.description).toBe('This payload must remain until delivery succeeds.');
});

test('release shell exposes keyboard navigation and accurate push-notification state', async ({ page }) => {
  await enterAsGuest(page);
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toHaveAttribute('href', '#main-content');
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Notifications', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Notifications', exact: true })).toBeVisible();
  await expect(page.getByText('Device push alerts are not enabled yet')).toBeVisible();
  await expect(page.getByText(/will not ask for notification permission/i)).toBeVisible();
});

test('previously opened canonical content remains available offline', async ({ page, context }, testInfo) => {
  await enterAsGuest(page);
  await page.getByText('Sambal Tina', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'abagat' })).toBeVisible();
  await page.waitForFunction(async () => (await caches.keys()).includes('masinloc-connect-canonical-v1'));

  await page.unroute('**/data/sambal-tina.json');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByText('Sambal Tina', { exact: true }).first()).toBeVisible();
  await context.setOffline(true);
  await expect(page.getByText('Offline mode', { exact: true })).toBeVisible();
  await page.getByText('Sambal Tina', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'abagat' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('offline-dictionary.png'), fullPage: false });
});
