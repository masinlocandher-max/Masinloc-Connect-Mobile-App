import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabase } from './platform.js';

const MOBILE_SUBMISSION_ENDPOINT = `${SUPABASE_URL}/functions/v1/mobile-community-submit`;

async function accessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export async function submitMobileContribution(category, payload) {
  const token = await accessToken();
  const response = await fetch(MOBILE_SUBMISSION_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_PUBLISHABLE_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ category, payload }),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || `Submission failed (${response.status})`);
  return data;
}

export async function getApplicationActivity(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('application_activity')
    .select('id,external_job_id,status,job_snapshot,handed_off_at,user_confirmed_applied_at,created_at,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function recordApplicationHandoff(userId, job) {
  if (!userId || !job?.id) return null;
  const { data: existing, error: findError } = await supabase
    .from('application_activity')
    .select('id')
    .eq('user_id', userId)
    .eq('external_job_id', job.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (findError) throw findError;

  const patch = {
    user_id: userId,
    external_job_id: job.id,
    status: 'handed_off',
    job_snapshot: {
      title: job.title || null,
      company: job.company || null,
      location: job.location || null,
      employment_type: job.employment_type || null,
      apply_url: job.apply_url || null,
    },
    handed_off_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const query = existing
    ? supabase.from('application_activity').update(patch).eq('id', existing.id)
    : supabase.from('application_activity').insert(patch);
  const { data, error } = await query.select('id,status,job_snapshot,handed_off_at,updated_at').single();
  if (error) throw error;
  return data;
}

export async function confirmApplicationApplied(userId, activityId) {
  if (!userId || !activityId) return null;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('application_activity')
    .update({ status: 'user_confirmed_applied', user_confirmed_applied_at: now, updated_at: now })
    .eq('id', activityId)
    .eq('user_id', userId)
    .select('id,status,user_confirmed_applied_at,updated_at')
    .single();
  if (error) throw error;
  return data;
}

export async function getBuyerOrders(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('pos_orders')
    .select('id,order_number,status,payment_status,total,fulfillment,customer_name,tracking_token,created_at,updated_at')
    .eq('buyer_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}
