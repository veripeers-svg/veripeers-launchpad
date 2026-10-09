import { describe, expect, it, vi } from 'vitest';
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => ({ middleware() { return this; }, inputValidator() { return this; }, handler: (handler: unknown) => handler }) }));
vi.mock('@tanstack/react-start/server', () => ({ setResponseHeader: vi.fn() }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
import { getAdminInquiries } from '@/lib/admin.functions';

const run = getAdminInquiries as unknown as (input: { data: { page: number; kind: string; search: string }; context: { userId: string; supabase: unknown } }) => Promise<{ rows: unknown[]; registrations: number; partnerships: number }>;
describe('Administrator-only submission access', () => {
  it('denies ordinary authenticated users before reading any candidate or partner data', async () => {
    const from = vi.fn();
    await expect(run({ data: { page: 0, kind: 'all', search: '' }, context: { userId: 'ordinary-user', supabase: { rpc: vi.fn().mockResolvedValue({ data: false, error: null }), from } } })).rejects.toThrow('Administrator access required.');
    expect(from).not.toHaveBeenCalled();
  });
  it('denies access when the administrator role check fails', async () => {
    const from = vi.fn();
    await expect(run({ data: { page: 0, kind: 'all', search: '' }, context: { userId: 'user', supabase: { rpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'Unavailable' } }), from } } })).rejects.toThrow('Administrator access required.');
    expect(from).not.toHaveBeenCalled();
  });
  it('returns both early-interest candidates and partners for a verified administrator', async () => {
    const rows = [{ id: '1', kind: 'registration', name: 'Candidate' }, { id: '2', kind: 'partnership', name: 'Partner' }];
    const chain = { select: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), range: vi.fn().mockResolvedValue({ data: rows, count: 2, error: null }), then: (resolve: (value: unknown) => unknown) => Promise.resolve({ count: 1, error: null }).then(resolve) };
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const result = await run({ data: { page: 0, kind: 'all', search: '' }, context: { userId: 'verified-admin', supabase: { rpc, from: () => chain } } });
    expect(rpc).toHaveBeenCalledWith('has_role', { _user_id: 'verified-admin', _role: 'admin' });
    expect(result.rows).toEqual(rows);
    expect(result.registrations).toBe(1);
    expect(result.partnerships).toBe(1);
  });
});