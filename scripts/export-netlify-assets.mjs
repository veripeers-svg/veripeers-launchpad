import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// This is a deployment-only script, never imported into the application.
const assetOrigin = 'https://veripeers-launchpad.lovable.app';

export function resolveAsset(pointer, outputDir) {
  const url = new URL(pointer.url, assetOrigin);
  if (url.origin !== assetOrigin || !url.pathname.startsWith('/__l5e/assets-v1/') || url.search || url.hash) {
    throw new Error('Expected a same-origin Lovable asset pointer');
  }
  const relative = decodeURIComponent(url.pathname).slice(1);
  const destination = path.resolve(outputDir, relative);
  if (!destination.startsWith(`${path.resolve(outputDir)}${path.sep}`)) {
    throw new Error('Asset destination must stay inside the publish directory');
  }
  return { url: url.href, destination };
}

export async function exportAsset(pointer, outputDir, fetchAsset = fetch) {
  const { url, destination } = resolveAsset(pointer, outputDir);
  const response = await fetchAsset(url, { headers: { Accept: '*/*' }, signal: AbortSignal.timeout(60_000) });
  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok || /text\/html|application\/json/i.test(contentType)) {
    throw new Error(`Cannot export ${pointer.original_filename}: HTTP ${response.status}, ${contentType}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length) throw new Error(`Empty asset: ${pointer.original_filename}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return destination;
}

async function findPointers(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return findPointers(file);
    return entry.name.endsWith('.asset.json') ? [file] : [];
  }));
  return nested.flat();
}

export async function exportNetlifyAssets(outputDir = 'dist') {
  const pointers = await findPointers('src');
  for (const file of pointers) {
    const pointer = JSON.parse(await readFile(file, 'utf8'));
    const destination = await exportAsset(pointer, outputDir);
    console.log(`Exported ${pointer.original_filename} to ${destination}`);
  }
  console.log(`Prepared ${pointers.length} assets for standalone Netlify hosting.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await exportNetlifyAssets(process.argv[2] ?? 'dist');
}