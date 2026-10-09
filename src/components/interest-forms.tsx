import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Check, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { categories, interests, roles, submissionSchema } from '@/lib/interest';
import { submitInquiry } from '@/lib/inquiries.functions';

export function InterestForm({ partnership = false }: { partnership?: boolean }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const saveInquiry = useServerFn(submitInquiry);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(data.entries());
    const result = submissionSchema.safeParse({ ...values, kind: partnership ? 'partnership' : 'registration', ...(partnership ? {} : { interests: data.getAll('interests') }) });
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map(issue => [String(issue.path[0]), issue.message])));
      return;
    }
    setErrors({});
    setSubmitError(undefined);
    setPending(true);
    try {
      const response = await saveInquiry({ data: result.data });
      if (response.success) setSuccess(true);
      else setSubmitError(response.error ?? 'Please try again shortly.');
    } catch {
      setSubmitError('We could not submit your inquiry. Please try again shortly.');
    } finally {
      setPending(false);
    }
  }
  function field(label: string, name: string, type = 'text', placeholder = '') {
    return <label className="field-label">{label}<input name={name} type={type} required maxLength={type === 'email' ? 254 : 100} placeholder={placeholder} aria-invalid={!!errors[name]} />{errors[name] && <span className="field-error">{errors[name]}</span>}</label>;
  }
  if (success) return <div className="form-feedback" role="status"><Check size={22} /><div><strong>Thank you for your interest.</strong><p>Our team will connect with you shortly.</p></div></div>;
  return <form onSubmit={submit} className="interest-form" aria-busy={pending}>
    <div className="form-grid">{partnership ? <>{field('Organization name', 'organization', 'text', 'Your organization')}<label className="field-label">Organization category<select name="category" required defaultValue=""><option value="" disabled>Select a category</option>{categories.map(category => <option key={category}>{category}</option>)}</select>{errors['category'] && <span className="field-error">{errors['category']}</span>}</label>{field('Contact person', 'contact', 'text', 'Your full name')}{field('Email address', 'email', 'email', 'you@organization.com')}</> : <>{field('Full name', 'name', 'text', 'Your full name')}<label className="field-label">I am a<select name="role" required defaultValue=""><option value="" disabled>Select your role</option>{roles.map(role => <option key={role}>{role}</option>)}</select>{errors['role'] && <span className="field-error">{errors['role']}</span>}</label>{field('Email address', 'email', 'email', 'you@example.com')}</>}</div>
    {partnership ? <label className="field-label">Proposed collaboration<textarea name="collaboration" required minLength={10} maxLength={2000} rows={4} placeholder="What could we build together?" />{errors['collaboration'] && <span className="field-error">{errors['collaboration']}</span>}</label> : <fieldset><legend className="field-label">What are you interested in?</legend><div className="interest-options">{interests.map(interest => <label key={interest}><input type="checkbox" name="interests" value={interest} /><span>{interest}</span></label>)}</div>{errors['interests'] && <p className="field-error">{errors['interests']}</p>}</fieldset>}
    {submitError && <p className="field-error" role="alert">{submitError}</p>}
    <Button type="submit" className="cta" disabled={pending}>{pending ? 'Submitting…' : partnership ? 'Send Partnership Inquiry' : 'Register My Interest'}{pending ? <LoaderCircle className="animate-spin" /> : <ArrowUpRight />}</Button>
    <p className="privacy-note"><ShieldCheck size={15} /><span>Your details will be handled responsibly and used in accordance with our <Link to="/privacy">Privacy Policy</Link>.</span></p>
  </form>;
}