import { describe, expect, it } from 'vitest';
import { getCountdown, LAUNCH_AT } from '@/lib/launch';
import { interestSchema, partnershipSchema } from '@/lib/interest';
describe('VeriPeers launch', () => {
  it('targets October 20, 2026 at midnight in India', () => { expect(LAUNCH_AT).toBe(Date.parse('2026-10-20T00:00:00+05:30')); });
  it('shows remaining days hours minutes and seconds', () => { expect(getCountdown(LAUNCH_AT - 90061000)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 }); });
  it('does not count below zero after launch', () => { expect(getCountdown(LAUNCH_AT + 1000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 }); });
});
describe('Inquiry validation', () => {
  it('accepts every requested individual role', () => { for (const role of ['Founder', 'Mentor', 'Student/Mentee', 'Other']) expect(interestSchema.safeParse({ name: 'Test Person', email: 'test@example.com', role, interests: ['Founder community'] }).success).toBe(true); });
  it('rejects missing interest areas and invalid emails', () => { expect(interestSchema.safeParse({ name: 'Test Person', email: 'not-an-email', role: 'Founder', interests: [] }).success).toBe(false); });
  it('requires all partnership contact and collaboration fields', () => { expect(partnershipSchema.safeParse({ organization: 'Test University', category: 'University / IIT / NIT', contact: '', email: 'test@example.com', collaboration: '' }).success).toBe(false); });
});