import esbuild from 'esbuild';

import path from 'path';

const addJsExtensionPlugin = {
  name: 'add-js-extension',
  setup(build) {
    build.onResolve({ filter: /^\.\// }, args => {
      if (!args.path.endsWith('.js')) {
        // Absolute path banate hain:
        const absolutePath = path.resolve(args.resolveDir, args.path + '.js');
        return { path: absolutePath, namespace: 'file' };
      }
    });
  }
};



esbuild.build({
    entryPoints: ['src/index.ts'],
    outdir: 'dist',
    bundle: false,
    platform: 'node',
    target: ['node14'],
    format: 'esm',
    sourcemap: true,
    plugins: [addJsExtensionPlugin],
  }).catch(() => process.exit(1));
