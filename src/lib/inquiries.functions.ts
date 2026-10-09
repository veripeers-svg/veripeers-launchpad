import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { submissionSchema } from '@/lib/interest';

export const submitInquiry = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => submissionSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) return { success: false, error: 'We could not submit your inquiry. Please try again shortly.' };
    // Write-only public client: visitors cannot read any inquiry details.
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      } },
    });
    const { error } = await client.from('veripeers_inquiries').insert({
      kind: data.kind,
      name: data.kind === 'registration' ? data.name : data.contact,
      email: data.email,
      details: data.kind === 'registration'
        ? { role: data.role, interests: data.interests }
        : { organization: data.organization, category: data.category, collaboration: data.collaboration },
    });
    if (error) {
      console.error('Inquiry save failed', { code: error.code });
      return { success: false, error: 'We could not submit your inquiry. Please try again shortly.' };
    }
    // Owner email notifications are pending a verified Lovable email domain.
    return { success: true, error: null };
  });