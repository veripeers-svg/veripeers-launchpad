import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export function AdminSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function signOut() {
    setPending(true); setError(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) { setPending(false); setError(true); return; }
    await navigate({ to: '/auth', replace: true });
  }
  return <div><Button variant="outline" onClick={signOut} disabled={pending}><LogOut />{pending ? 'Signing out…' : 'Sign out'}</Button>{error && <p role="alert" className="mt-2 text-sm text-destructive">Could not sign out. Please try again.</p>}</div>;
}