import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: { alias: { './runtimeConfig': './runtimeConfig.browser' } },
  plugins: [
    {
      // npm overrides cannot reach @aws-amplify/ui-react's nested copies of
      // @aws-amplify/ui and @xstate/react, so Rollup deduplicates their
      // xstate imports up to the top-level v5 and the build fails with
      // `"actions" is not exported by xstate`. Redirect those imports to the
      // xstate-v4 alias at build time. Must be a top-level vite plugin (not
      // build.rolldownOptions.plugins) with enforce: 'pre' to run before
      // the bundler's default resolver.
      name: 'resolve-xstate-v4-for-amplify',
      enforce: 'pre',
      async resolveId(source, importer) {
        if (
          source === 'xstate' &&
          importer &&
          importer.includes('@aws-amplify')
        ) {
          return this.resolve('xstate-v4', importer, { skipSelf: true });
        }
        return null;
      },
    },
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      injectRegister: 'auto',
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'Bedrock Chat',
        short_name: 'Bedrock Chat',
        description: 'AWS-native chatbot using Bedrock',
        start_url: '/index.html',
        display: 'standalone',
        theme_color: '#232F3E',
        icons: [
          {
            src: '/images/bedrock_icon_72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/images/bedrock_icon_96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/images/bedrock_icon_128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: '/images/bedrock_icon_144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/images/bedrock_icon_152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: '/images/bedrock_icon_192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/images/bedrock_icon_384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: '/images/bedrock_icon_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/images/bedrock_icon_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    rolldownOptions: {
      plugins: [
        {
          // The dev server pre-bundles dependencies with Rolldown, which does
          // not run the resolveId hook of the Vite plugin above. Apply the same
          // xstate-v4 redirect to the optimizer so that `npm run dev` works too.
          name: 'resolve-xstate-v4-for-amplify-optimizer',
          async resolveId(source, importer) {
            if (
              source === 'xstate' &&
              importer &&
              importer.includes('@aws-amplify')
            ) {
              return this.resolve('xstate-v4', importer, { skipSelf: true });
            }
            return null;
          },
        },
      ],
    },
  },
  server: { host: true },
});
