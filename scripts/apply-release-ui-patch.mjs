import fs from 'node:fs';

const path = 'src/App.jsx';
let source = fs.readFileSync(path, 'utf8');

if (!source.includes("import { requestAccountDeletion } from './lib/account.js';")) {
  source = source.replace(
    "import { assets, MASINLOC_CENTER, routes, WEATHER_ENDPOINT, WEBSITE_BASE } from './config.js';",
    "import { assets, MASINLOC_CENTER, routes, WEATHER_ENDPOINT, WEBSITE_BASE } from './config.js';\nimport { requestAccountDeletion } from './lib/account.js';",
  );
}

source = source.replace(/\n\s*Bell,/, '');

source = source.replace(
`        <button className="icon-button" type="button" aria-label="Notifications" disabled title="Notification delivery will activate after native push setup">
          <Bell size={20} strokeWidth={1.9} />
        </button>
`,
'',
);

source = source.replace(
"  const [state, setState] = useState('idle');\n  if (!user) return <EmptyState icon={UserRound} title=\"Sign in to open your profile\" body=\"Registration is only required for saved and personalized features.\" />;",
"  const [state, setState] = useState('idle');\n  const [deleteState, setDeleteState] = useState('idle');\n  if (!user) return <EmptyState icon={UserRound} title=\"Sign in to open your profile\" body=\"Registration is only required for saved and personalized features.\" />;",
);

if (!source.includes('const deleteAccount = async () => {')) {
  source = source.replace(
`  const save = async (event) => {
    event.preventDefault();
    setState('saving');
    try {
      const profile = await saveMemberProfile(user.id, form);
      onProfileSaved(profile);
      setState('saved');
    } catch { setState('error'); }
  };
`,
`  const save = async (event) => {
    event.preventDefault();
    setState('saving');
    try {
      const profile = await saveMemberProfile(user.id, form);
      onProfileSaved(profile);
      setState('saved');
    } catch { setState('error'); }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm('Delete your Masinloc Connect account? Your profile, saved items, saved jobs and resume data will be removed. This cannot be undone.');
    if (!confirmed) return;
    setDeleteState('deleting');
    try {
      await requestAccountDeletion();
      setDeleteState('deleted');
      navigate('home');
    } catch (error) {
      setDeleteState('error');
    }
  };
`,
  );
}

if (!source.includes('Emergency reports and required transaction or audit records may be retained')) {
  source = source.replace(
`      <button className="secondary-button full" type="button" onClick={() => signOut()}>Sign out</button>
`,
`      <button className="secondary-button full" type="button" onClick={() => signOut()}>Sign out</button>
      <section className="account-danger-zone" aria-labelledby="delete-account-title">
        <h2 id="delete-account-title">Delete account</h2>
        <p>Deletes your account, profile, saved items, saved jobs and resume data. Emergency reports and required transaction or audit records may be retained where needed for safety or recordkeeping without an active account.</p>
        {deleteState === 'error' ? <p className="form-error">Could not delete your account right now. Please try again.</p> : null}
        <button className="secondary-button full" type="button" disabled={deleteState === 'deleting'} onClick={deleteAccount}>{deleteState === 'deleting' ? 'Deleting account…' : 'Delete account'}</button>
      </section>
`,
  );
}

fs.writeFileSync(path, source);
console.log('Release UI account-deletion patch applied.');
