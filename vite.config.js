import { defineConfig } from 'vite';
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
  root: '.',
  base: '/Aither/',
  define: {
    __ADMIN_HASH__: JSON.stringify(process.env.VITE_ADMIN_PASS_HASH || ''),
  },
  plugins: [
    javascriptObfuscator({
      options: {
        // Moderate obfuscation - balance between security and performance
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.2,
        debugProtection: false, // Set to true for extra protection (impacts performance)
        debugProtectionInterval: 0,
        disableConsoleOutput: false, // Set to true to remove console.logs
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: true, // Prevents code formatting/beautification
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.5,
        stringArrayEncoding: ['base64'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 2,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: false,
      },
      apply: 'build', // Only apply in production builds, not in dev
    }),
  ],
  build: {
    outDir: 'dist',
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: false, // Set to true to remove console.logs
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: 'index.html',
        aboutus: 'aboutus.html',
        login: 'login.html',
        player: 'player.html',
        admin: 'admin.html',
        reset: 'reset-admin.html'
      }
    }
  },
  server: {
    port: 3010,
    open: '/login.html'
  }
});
