import { SUPABASE_URL, supabase } from './platform.js';

export async function requestAccountDeletion() {
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const session = data.session;
  if (!session?.access_token) throw new Error('Sign in again before deleting your account.');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-mobile-account`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: session.access_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ confirm: true }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.error || 'Could not delete your account.');

  // Clear any locally cached session immediately. The server has already made
  // the Auth identity unusable, so this is local cleanup rather than security.
  await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
  return true;
}
