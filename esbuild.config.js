const path = require('path');
const { build } = require('esbuild');
const { fileURLToPath, URL } = require('node:url');

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  outfile: 'dist/index.js',
  sourcemap: true,
  tsconfig: 'tsconfig.json',
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
}).catch(() => process.exit(1));
