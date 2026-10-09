import { useEffect, useState } from 'react';
import logo from '@/assets/veripeers-logo.png.asset.json';

/** CSS owns the timeline; remove the overlay only after its fade has finished. */
export function BrandIntro() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(() => setDone(true), reduced ? 1000 : 3600);
    return () => window.clearTimeout(t);
  }, []);
  if (done) return null;
  return (
    <div className="brand-intro" aria-hidden="true" onAnimationEnd={event => {
      if (event.target === event.currentTarget && event.animationName === 'intro-out') setDone(true);
    }}>
      <div className="brand-intro-inner">
        <img className="intro-logo" src={logo.url} alt="" />
        <svg className="intro-tick" viewBox="0 0 64 64" fill="none">
          <circle className="intro-ring" cx="32" cy="32" r="28" />
          <path className="intro-check" d="M20 33.5l8 8 16-17" />
        </svg>
        <p className="intro-line">Built on Trust. Driven by Potential.</p>
        <p className="intro-caption">Welcome to VeriPeers</p>
      </div>
    </div>
  );
}

export function Tick({ size = 16 }: { size?: number }) {
  return <svg className="brand-tick" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10.5" /><path d="M7.5 12.3l3 3 6-6.3" /></svg>;
}
