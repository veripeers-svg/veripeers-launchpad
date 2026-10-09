import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Check, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { categories, interests, roles, interestSchema, partnershipSchema, emailDraft } from '@/lib/interest';

export function InterestForm({ partnership = false }: { partnership?: boolean }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<string>();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(data.entries());
    const result = partnership ? partnershipSchema.safeParse(values) : interestSchema.safeParse({ ...values, interests: data.getAll('interests') });
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map(issue => [String(issue.path[0]), issue.message])));
      return;
    }
    setErrors({});
    const body = Object.entries(result.data).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n\n');
    const url = emailDraft(partnership ? 'partnerships@veripeers.com' : 'community@veripeers.com', partnership ? 'VeriPeers partnership inquiry' : 'VeriPeers early interest', body);
    setDraft(url);
    window.location.href = url;
  }
  function field(label: string, name: string, type = 'text', placeholder = '') {
    return <label className="field-label">{label}<input name={name} type={type} required maxLength={type === 'email' ? 254 : 100} placeholder={placeholder} aria-invalid={!!errors[name]} />{errors[name] && <span className="field-error">{errors[name]}</span>}</label>;
  }
  return <form onSubmit={submit} className="interest-form">
    <div className="form-grid">{partnership ? <>{field('Organization name', 'organization', 'text', 'Your organization')}<label className="field-label">Organization category<select name="category" required defaultValue=""><option value="" disabled>Select a category</option>{categories.map(category => <option key={category}>{category}</option>)}</select>{errors['category'] && <span className="field-error">{errors['category']}</span>}</label>{field('Contact person', 'contact', 'text', 'Your full name')}{field('Email address', 'email', 'email', 'you@organization.com')}</> : <>{field('Full name', 'name', 'text', 'Your full name')}<label className="field-label">I am a<select name="role" required defaultValue=""><option value="" disabled>Select your role</option>{roles.map(role => <option key={role}>{role}</option>)}</select>{errors['role'] && <span className="field-error">{errors['role']}</span>}</label>{field('Email address', 'email', 'email', 'you@example.com')}</>}</div>
    {partnership ? <label className="field-label">Proposed collaboration<textarea name="collaboration" required minLength={10} maxLength={2000} rows={4} placeholder="What could we build together?" />{errors['collaboration'] && <span className="field-error">{errors['collaboration']}</span>}</label> : <fieldset><legend className="field-label">What are you interested in?</legend><div className="interest-options">{interests.map(interest => <label key={interest}><input type="checkbox" name="interests" value={interest} /><span>{interest}</span></label>)}</div>{errors['interests'] && <p className="field-error">{errors['interests']}</p>}</fieldset>}
    <p className="email-note"><Mail size={14} /> Opens an email draft to the VeriPeers team. Send it to complete your inquiry.</p>
    <Button type="submit" className="cta">{partnership ? 'Send Partnership Inquiry' : 'Register My Interest'}<ArrowUpRight /></Button>
    <p className="privacy-note"><ShieldCheck size={15} /><span>Your details will be handled responsibly and used in accordance with our <Link to="/privacy">Privacy Policy</Link>.</span></p>
    {draft && <div className="form-feedback" role="status"><Check size={18} /><div>Your email draft is ready. Please send it in your email app to complete your inquiry. <a href={draft}>Open the draft again</a>.</div></div>}
  </form>;
}