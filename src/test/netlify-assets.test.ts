// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { exportAsset, resolveAsset } from '../../scripts/export-netlify-assets.mjs';
import logo from '../assets/veripeers-logo.png.asset.json';
import team from '../assets/veripeers-team.jpg.asset.json';

describe('Netlify media deployment', () => {
  it('exports the official logo and photograph at their existing public paths', () => {
    for (const pointer of [logo, team]) {
      const asset = resolveAsset(pointer, '/tmp/publish');
      expect(asset.url).toBe(`https://veripeers-launchpad.lovable.app${pointer.url}`);
      expect(asset.destination).toBe(`/tmp/publish${pointer.url}`);
    }
  });

  it('preserves animated GIF bytes without converting them', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'veripeers-media-'));
    const bytes = new Uint8Array([71, 73, 70, 56, 57, 97, 1, 2, 3]);
    try {
      const destination = await exportAsset({ url: '/__l5e/assets-v1/example/animation.gif', original_filename: 'animation.gif' }, directory,
        async () => new Response(bytes, { headers: { 'content-type': 'image/gif' } }));
      expect(new Uint8Array(await readFile(destination))).toEqual(bytes);
    } finally { await rm(directory, { recursive: true, force: true }); }
  });

  it('fails deployment instead of exporting an HTML error as a logo', async () => {
    await expect(exportAsset(logo, '/tmp/publish', async () => new Response('<html>Not found</html>', { headers: { 'content-type': 'text/html' } }))).rejects.toThrow('Cannot export');
  });

  it('rejects pointers outside the public asset origin', () => {
    expect(() => resolveAsset({ url: 'https://example.com/logo.png' }, '/tmp/publish')).toThrow('Expected a same-origin');
  });
});