interface AssetPointer {
  url: string;
  original_filename?: string;
}
export function resolveAsset(pointer: AssetPointer, outputDir: string): { url: string; destination: string };
export function exportAsset(pointer: AssetPointer, outputDir: string, fetchAsset?: typeof fetch): Promise<string>;
export function exportNetlifyAssets(outputDir?: string): Promise<void>;