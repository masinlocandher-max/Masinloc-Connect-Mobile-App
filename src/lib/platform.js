import { Capacitor } from '@capacitor/core';
import { createClient } from '@supabase/supabase-js';
import { WEBSITE_BASE } from '../config.js';

export const SUPABASE_URL = 'https://uwcqvsitjtknxsaypjxj.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qsC-udp3YoJQFuE-lHPivg_wa8gYMeg';
export const EMERGENCY_ENDPOINT = `${SUPABASE_URL}/functions/v1/emergency-response`;
export const NATIVE_AUTH_REDIRECT = 'masinlocconnect://auth/callback';

const isNativePlatform = Capacitor.isNativePlatform();

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: !isNativePlatform,
    flowType: 'pkce',
  },
});

const RAW_DATA_BASE = 'https://raw.githubusercontent.com/masinlocandher-max/Masinloc-Website/main/data';
const DATA_FILES = {
  marketplace: 'marketplace.json',
  marketplaceLogos: 'marketplace-logos.json',
  mabayani: 'mabayani.json',
  dictionary: 'sambal-tina.json',
  discover: 'discover.json',
  bulletin: 'bulletin.json',
};

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

export async function loadCanonicalData(key, signal) {
  const file = DATA_FILES[key];
  if (!file) throw new Error(`Unknown canonical data source: ${key}`);
  try {
    return await fetchJson(`${WEBSITE_BASE}/data/${file}`, signal);
  } catch (websiteError) {
    try {
      return await fetchJson(`${RAW_DATA_BASE}/${file}`, signal);
    } catch {
      throw websiteError;
    }
  }
}

export async function getLiveJobs() {
  const { data, error } = await supabase
    .from('external_jobs')
    .select('id,provider_id,title,company,location,work_setup,employment_type,salary_text,description_excerpt,requirements_excerpt,published_at,closing_date,apply_url,verification_status')
    .order('published_at', { ascending: false })
    .limit(80);
  if (error) throw error;
  return data || [];
}

export async function getJobProviders() {
  const { data, error } = await supabase
    .from('job_providers')
    .select('id,name,attribution_label,homepage_url,public_note,status')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function sendEmailSignIn(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Enter your email address.');
  const redirectTo = isNativePlatform
    ? NATIVE_AUTH_REDIRECT
    : (import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.href.split('#')[0]);
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function handleAuthCallback(url) {
  if (!url) return null;
  const parsed = new URL(url);
  const errorDescription = parsed.searchParams.get('error_description') || parsed.searchParams.get('error');
  if (errorDescription) throw new Error(errorDescription);

  const code = parsed.searchParams.get('code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session || null;
  }

  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw error;
    return data.session || null;
  }
  return null;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getMemberProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('member_profiles')
    .select('user_id,display_name,current_location,onboarding_status')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveMemberProfile(userId, patch) {
  const changes = {
    display_name: patch.display_name?.trim() || null,
    current_location: patch.current_location?.trim() || null,
    updated_at: new Date().toISOString(),
  };
  const { data: existing, error: readError } = await supabase
    .from('member_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (readError) throw readError;

  const query = existing
    ? supabase.from('member_profiles').update(changes).eq('user_id', userId)
    : supabase.from('member_profiles').insert({ user_id: userId, ...changes });
  const { data, error } = await query
    .select('user_id,display_name,current_location,onboarding_status')
    .single();
  if (error) throw error;
  return data;
}

export async function getSavedContent(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('saved_content')
    .select('content_type,content_key,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function toggleSavedContent(userId, contentType, contentKey, currentlySaved) {
  if (currentlySaved) {
    const { error } = await supabase
      .from('saved_content')
      .delete()
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_key', contentKey);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase
    .from('saved_content')
    .insert({ user_id: userId, content_type: contentType, content_key: contentKey });
  if (error && error.code !== '23505') throw error;
  return true;
}

export async function getSavedJobs(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('external_job_id,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function toggleSavedJob(userId, jobId, currentlySaved) {
  if (currentlySaved) {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('external_job_id', jobId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase
    .from('saved_jobs')
    .insert({ user_id: userId, external_job_id: jobId });
  if (error && error.code !== '23505') throw error;
  return true;
}

export async function getCareerProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('career_profiles')
    .select('user_id,full_name,preferred_email,current_location,target_roles,skills,education_level,school,profile_summary,availability,profile_completion,updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getResumeVersions(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('resume_versions')
    .select('id,name,target_role,template_code,is_primary,created_at,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveSignatureResume(user, form) {
  const skills = String(form.skills || '').split(',').map((item) => item.trim()).filter(Boolean);
  const targetRoles = form.target_role?.trim() ? [form.target_role.trim()] : [];
  const profile = {
    user_id: user.id,
    full_name: form.full_name.trim(),
    preferred_email: user.email,
    current_location: form.current_location.trim() || null,
    target_roles: targetRoles,
    skills,
    profile_summary: form.profile_summary.trim() || null,
    availability: form.availability.trim() || null,
    profile_completion: form.full_name.trim() && targetRoles.length ? 70 : 40,
    updated_at: new Date().toISOString(),
  };
  const { error: profileError } = await supabase
    .from('career_profiles')
    .upsert(profile, { onConflict: 'user_id' });
  if (profileError) throw profileError;

  const snapshot = {
    full_name: profile.full_name,
    preferred_email: profile.preferred_email,
    current_location: profile.current_location,
    target_roles: profile.target_roles,
    skills: profile.skills,
    profile_summary: profile.profile_summary,
    availability: profile.availability,
  };
  const { data, error } = await supabase
    .from('resume_versions')
    .insert({
      user_id: user.id,
      name: form.name.trim() || 'Signature Resume',
      target_role: form.target_role.trim() || null,
      template_code: 'signature_v1',
      resume_snapshot: snapshot,
      is_primary: true,
    })
    .select('id,name,target_role,is_primary,created_at,updated_at')
    .single();
  if (error) throw error;
  return data;
}

function emergencyRequest(payload) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 12000);
  return fetch(EMERGENCY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: controller.signal,
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }).finally(() => window.clearTimeout(timer));
}

export async function submitEmergencyReport(report) {
  return emergencyRequest({ action: 'submit', report });
}

export async function getEmergencyStatus(clientReportId, reportSecret) {
  return emergencyRequest({
    action: 'status',
    client_report_id: clientReportId,
    report_secret: reportSecret,
  });
}

export function randomReportSecret() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let value = '';
  bytes.forEach((byte) => { value += String.fromCharCode(byte); });
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
