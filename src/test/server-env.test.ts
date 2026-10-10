import { describe, expect, it } from 'vitest';
import { applyServerEnvFallback } from '@/lib/server-env';

describe('Server backend settings on external hosts', () => {
  it('uses the build-time backend values when the host runtime has none', () => {
    const env = applyServerEnvFallback({}, { VITE_SUPABASE_URL: 'https://backend.example', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_x' });
    expect(env['SUPABASE_URL']).toBe('https://backend.example');
    expect(env['SUPABASE_PUBLISHABLE_KEY']).toBe('sb_publishable_x');
  });
  it('keeps values the host runtime already provides', () => {
    const env = applyServerEnvFallback({ SUPABASE_URL: 'https://runtime.example' }, { VITE_SUPABASE_URL: 'https://backend.example' });
    expect(env['SUPABASE_URL']).toBe('https://runtime.example');
  });
});
