// Some hosts (e.g. Netlify) expose netlify.toml build variables only during the
// build, not to the running server functions. The public backend URL and
// publishable key are inlined into the bundle as VITE_* values at build time,
// so copy them into the server-side names when the runtime does not provide them.
type Env = Record<string, string | undefined>;

export function applyServerEnvFallback(env: Env, inlined: Env) {
  const pairs: Array<[string, string]> = [
    ['SUPABASE_URL', 'VITE_SUPABASE_URL'],
    ['SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY'],
    ['SUPABASE_PROJECT_ID', 'VITE_SUPABASE_PROJECT_ID'],
  ];
  for (const [serverName, publicName] of pairs) {
    if (!env[serverName] && inlined[publicName]) env[serverName] = inlined[publicName];
  }
  return env;
}

export function ensureServerEnv() {
  if (typeof process === 'undefined' || !process.env) return;
  applyServerEnvFallback(process.env as Env, {
    VITE_SUPABASE_URL: import.meta.env['VITE_SUPABASE_URL'],
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'],
    VITE_SUPABASE_PROJECT_ID: import.meta.env['VITE_SUPABASE_PROJECT_ID'],
  });
}
