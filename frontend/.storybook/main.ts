import type { StorybookConfig } from '@storybook/react-vite';
import type { PluginOption } from 'vite';

// The Service Worker registered by vite-plugin-pwa conflicts with the msw Service Worker,
// so the PWA plugins are excluded in Storybook.
const isPwaPlugin = (plugin: PluginOption): boolean =>
  !!plugin &&
  typeof plugin === 'object' &&
  'name' in plugin &&
  typeof plugin.name === 'string' &&
  plugin.name.startsWith('vite-plugin-pwa');

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-themes', 'msw-storybook-addon'],
  // ../public serves the app's static assets. ./public serves mockServiceWorker.js
  // for msw. It is kept out of ../public so it is not shipped with the app build.
  staticDirs: ['../public', './public'],
  viteFinal: (config) => {
    config.plugins = (config.plugins ?? [])
      .flat(Infinity as 1)
      .filter((plugin) => !isPwaPlugin(plugin));
    return config;
  },
};

export default config;
