import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LoaderCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminSignOut } from '@/components/admin-sign-out';
import logo from '@/assets/veripeers-logo.png.asset.json';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Administrator Login — VeriPeers' },
    { name: 'description', content: 'Private administrator sign-in for VeriPeers.' },
    { property: 'og:title', content: 'VeriPeers — Administrator Login' },
    { property: 'og:description', content: 'Private administrator sign-in for VeriPeers.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }), component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let active = true;
    async function check() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (data.user) {
        setSignedIn(true);
        const { data: admin } = await supabase.rpc('has_role', { _user_id: data.user.id, _role: 'admin' });
        if (!active) return;
        if (admin === true) { await navigate({ to: '/admin', replace: true }); return; }
        setError('This account does not have administrator access.');
      } else setSignedIn(false);
      setChecking(false);
    }
    void check().catch(() => { if (active) { setChecking(false); setError('Unable to check your account. Please try again.'); } });
    return () => { active = false; };
  }, [navigate]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: String(form.get('email')).trim(), password: String(form.get('password')) });
      if (loginError || !data.user) { setError('Unable to sign in. Check your email and password and try again.'); return; }
      setSignedIn(true);
      const { data: admin, error: roleError } = await supabase.rpc('has_role', { _user_id: data.user.id, _role: 'admin' });
      if (roleError || admin !== true) { setError('This account does not have administrator access.'); return; }
      await navigate({ to: '/admin', replace: true });
    } catch { setError('Unable to sign in right now. Please try again.'); }
    finally { setPending(false); }
  }
  return <main className="mx-auto min-h-screen max-w-lg px-6 py-10">
    <Link to="/"><img src={logo.url} alt="VeriPeers" className="h-24 w-48 object-contain" /></Link>
    <Button asChild variant="link" className="mt-6 px-0"><Link to="/"><ArrowLeft />Back to VeriPeers</Link></Button>
    <div className="mt-12 border-b border-border pb-6"><LockKeyhole className="mb-5 text-primary" /><p className="text-sm font-medium text-primary">VERIPEERS ADMINISTRATION</p><h1 className="mt-3 text-3xl font-semibold">Administrator login</h1></div>
    {checking ? <p role="status" className="mt-8 text-muted-foreground">Checking account…</p> : signedIn ? <div className="mt-8 space-y-5"><p role="alert" className="text-destructive">{error}</p><AdminSignOut /></div> : <form onSubmit={submit} className="mt-8 space-y-6">
      <div><label htmlFor="admin-email" className="mb-2 block text-sm font-medium">Email address</label><Input id="admin-email" name="email" type="email" autoComplete="username" required className="h-11" /></div>
      <div><label htmlFor="admin-password" className="mb-2 block text-sm font-medium">Password</label><div className="relative"><Input id="admin-password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required className="h-11 pr-12" /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" aria-label={visible ? 'Hide password' : 'Show password'} title={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</Button></div></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="h-11 w-full" disabled={pending}>{pending ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <LockKeyhole />}{pending ? 'Signing in…' : 'Sign in'}</Button>
    </form>}
  </main>;
}