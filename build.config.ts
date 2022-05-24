import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/index',
    './src/vite',
    './src/types',
    // './src/rollup',
    // './src/esbuild',
    // './src/webpack',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  alias: {
    '@': './src',
  },
})
