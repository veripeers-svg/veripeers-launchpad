import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Eye, RefreshCw, Search, ShieldCheck, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AdminSignOut } from '@/components/admin-sign-out';
import { getAdminInquiries } from '@/lib/admin.functions';
import logo from '@/assets/veripeers-logo.png.asset.json';

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({ meta: [
    { title: 'Submissions — VeriPeers Administration' },
    { name: 'description', content: 'Private VeriPeers early-interest and partnership submissions.' },
    { property: 'og:title', content: 'VeriPeers — Private Submissions' },
    { property: 'og:description', content: 'Private VeriPeers administration.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }), component: AdminPage,
});
type Inquiry = Awaited<ReturnType<typeof getAdminInquiries>>['rows'][number];
function detail(row: Inquiry, key: string) {
  const details = row.details;
  if (!details || typeof details !== 'object' || Array.isArray(details)) return '—';
  const value = details[key];
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string').join(', ') || '—';
  return typeof value === 'string' ? value : '—';
}
function date(value: string) {
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
function AdminPage() {
  const fetchInquiries = useServerFn(getAdminInquiries);
  const [page, setPage] = useState(0);
  const [kind, setKind] = useState<'all' | 'registration' | 'partnership'>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const query = useQuery({
    queryKey: ['admin-inquiries', page, kind, search],
    queryFn: () => fetchInquiries({ data: { page, kind, search } }),
    retry: false, refetchInterval: 30_000,
  });
  const data = query.data;
  const count = data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(count / 50));
  function searchSubmit(event: FormEvent) { event.preventDefault(); setPage(0); setSearch(draft.trim()); }
  return <div className="min-h-screen bg-background">
    <header className="border-b border-border"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4"><Link to="/"><img src={logo.url} alt="VeriPeers" className="h-20 w-44 object-contain" /></Link><div className="flex items-center gap-5"><span className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><ShieldCheck className="size-4 text-primary" />Private administration</span><AdminSignOut /></div></div></header>
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-sm font-medium text-primary">PEOPLE & PARTNERSHIPS</p><h1 className="mt-3 text-3xl font-semibold">Submissions</h1><p className="mt-3 text-sm text-muted-foreground">{query.dataUpdatedAt ? `Updated ${date(new Date(query.dataUpdatedAt).toISOString())} IST` : 'Early interest and partnership inquiries'}</p></div><Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw className={query.isFetching ? 'animate-spin motion-reduce:animate-none' : ''} />Refresh</Button></div>
      <div className="my-9 grid grid-cols-1 gap-6 border-y border-border py-6 sm:grid-cols-3">{[
        { label: 'Total submissions', icon: ShieldCheck, value: data ? data.registrations + data.partnerships : '—' },
        { label: 'Early interest', icon: Users, value: data?.registrations ?? '—' },
        { label: 'Partnership inquiries', icon: Building2, value: data?.partnerships ?? '—' },
      ].map(stat => <div key={stat.label}><div className="flex items-center gap-2 text-sm text-muted-foreground"><stat.icon className="size-4 text-primary" />{stat.label}</div><p className="mt-3 text-3xl font-semibold tabular-nums">{stat.value}</p></div>)}</div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-5"><div className="flex flex-wrap gap-2" role="group" aria-label="Submission type">{([['all', 'All'], ['registration', 'Early interest'], ['partnership', 'Partnerships']] as const).map(([value, label]) => <Button key={value} variant={kind === value ? 'default' : 'outline'} aria-pressed={kind === value} onClick={() => { setKind(value); setPage(0); }}>{label}</Button>)}</div><form onSubmit={searchSubmit} className="flex w-full gap-2 sm:w-auto"><Input aria-label="Search by name or email" placeholder="Search name or email" value={draft} maxLength={100} onChange={event => setDraft(event.target.value)} className="min-w-0 sm:w-64" /><Button type="submit" variant="outline" size="icon" aria-label="Search submissions" title="Search submissions"><Search /></Button>{search && <Button variant="ghost" type="button" onClick={() => { setDraft(''); setSearch(''); setPage(0); }}>Clear</Button>}</form></div>
      {query.isPending ? <p role="status" className="border-y border-border py-16 text-center text-muted-foreground">Loading submissions…</p> : query.isError ? <div role="alert" className="border-y border-border py-10"><p className="text-destructive">Submissions could not be loaded. Your account must have administrator access.</p><Button className="mt-5" variant="outline" onClick={() => void query.refetch()}>Try again</Button></div> : <>
        <div className="overflow-x-auto border-y border-border"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-secondary text-muted-foreground"><tr>{['Name / contact', 'Type', 'Email', 'Submitted (IST)', 'Details'].map(title => <th key={title} className="px-4 py-4 font-medium">{title}</th>)}</tr></thead><tbody>{data?.rows.map(row => <tr key={row.id} className="border-t border-border"><td className="max-w-64 px-4 py-5"><p className="break-words font-medium">{row.name}</p><p className="mt-1 break-words text-xs text-muted-foreground">{detail(row, row.kind === 'partnership' ? 'organization' : 'role')}</p></td><td className="px-4 py-5"><span className={row.kind === 'partnership' ? 'text-navy' : 'text-primary'}>{row.kind === 'partnership' ? 'Partnership' : 'Early interest'}</span></td><td className="max-w-72 break-all px-4 py-5"><a href={`mailto:${row.email}`} className="text-primary hover:underline">{row.email}</a></td><td className="whitespace-nowrap px-4 py-5 text-muted-foreground">{date(row.created_at)}</td><td className="px-4 py-5"><Button variant="ghost" size="icon" title={`View ${row.name}`} aria-label={`View ${row.name}`} onClick={() => setSelected(row)}><Eye /></Button></td></tr>)}</tbody></table>{data?.rows.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">{search || kind !== 'all' ? 'No submissions match these filters.' : 'No submissions yet.'}</p>}</div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{count === 0 ? '0 submissions' : `${page * 50 + 1}–${Math.min((page + 1) * 50, count)} of ${count} submissions`}</p><div className="flex items-center gap-4"><Button variant="outline" size="icon" title="Previous page" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)}><ArrowLeft /></Button><span className="text-sm">{page + 1} / {pages}</span><Button variant="outline" size="icon" title="Next page" aria-label="Next page" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}><ArrowRight /></Button></div></div>
      </>}
    </main>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{selected?.kind === 'partnership' ? 'Partnership inquiry' : 'Early-interest registration'}</DialogTitle><DialogDescription>Submitted {selected ? `${date(selected.created_at)} IST` : ''}</DialogDescription></DialogHeader>{selected && <dl className="mt-4 space-y-5">{[
      ['Name / contact', selected.name], ['Email', selected.email],
      ...(selected.kind === 'partnership' ? [['Organization', detail(selected, 'organization')], ['Category', detail(selected, 'category')], ['Proposed collaboration', detail(selected, 'collaboration')]] : [['Role', detail(selected, 'role')], ['Areas of interest', detail(selected, 'interests')]]),
    ].map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">{value}</dd></div>)}</dl>}</DialogContent></Dialog>
  </div>;
}