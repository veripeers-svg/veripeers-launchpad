import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getAdminInquiries = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    page: z.number().int().min(0).default(0),
    kind: z.enum(['all', 'registration', 'partnership']).default('all'),
    search: z.string().max(100).default(''),
  }).parse(input))
  .handler(async ({ data, context }) => {
    setResponseHeader('Cache-Control', 'private, no-store');
    const { data: admin, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (roleError || admin !== true) throw new Error('Administrator access required.');
    let query = context.supabase.from('veripeers_inquiries')
      .select('id, kind, name, email, details, created_at', { count: 'exact' })
      .order('created_at', { ascending: false }).order('id', { ascending: false });
    if (data.kind !== 'all') query = query.eq('kind', data.kind);
    const search = data.search.replace(/[^\p{L}\p{N}@ .+\-]/gu, '').trim();
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    const [result, registrations, partnerships] = await Promise.all([
      query.range(data.page * 50, data.page * 50 + 49),
      context.supabase.from('veripeers_inquiries').select('id', { count: 'exact', head: true }).eq('kind', 'registration'),
      context.supabase.from('veripeers_inquiries').select('id', { count: 'exact', head: true }).eq('kind', 'partnership'),
    ]);
    if (result.error || registrations.error || partnerships.error) throw new Error('Unable to load submissions. Please try again.');
    return { rows: result.data ?? [], count: result.count ?? 0, registrations: registrations.count ?? 0, partnerships: partnerships.count ?? 0 };
  });