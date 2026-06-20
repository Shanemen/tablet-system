/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  // Don't bundle the font-subsetting deps: subset-font loads harfbuzz via a .wasm file whose
  // path breaks when bundled (ENOENT '.../hb-subset.wasm [app-route] (wasm module)'), which made
  // dynamic subsetting silently fall back to the static subset. Keeping them external lets them
  // resolve from node_modules at runtime so the wasm is found.
  serverExternalPackages: ['subset-font', 'harfbuzzjs', 'fontverter'],
}

export default nextConfig
