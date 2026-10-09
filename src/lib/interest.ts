import { z } from 'zod';
export const roles = ['Founder', 'Mentor', 'Student/Mentee', 'Other'] as const;
export const interests = ['Mentorship & connections', 'Founder community', 'AI & technology resources', 'Programs & opportunities'] as const;
export const categories = ['University / IIT / NIT', 'E-Cell / Entrepreneurship club', 'Company / AI technology provider', 'Incubator / Accelerator', 'Founder community / Industry experts', 'Other'] as const;
const name = z.string().trim().min(2, 'Please enter at least 2 characters.').max(100);
const email = z.string().trim().email('Please enter a valid email address.').max(254);
export const interestSchema = z.object({ name, email, role: z.enum(roles), interests: z.array(z.enum(interests)).min(1, 'Select at least one area of interest.') });
export const partnershipSchema = z.object({ organization: name, category: z.enum(categories), contact: name, email, collaboration: z.string().trim().min(10, 'Please tell us a little more (at least 10 characters).').max(2000) });
export function emailDraft(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}