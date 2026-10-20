/// <reference types="vite/client" />
import type { Preview, ReactRenderer } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import '../src/i18n';
import '../src/index.css';

// MSW is initialized by msw-storybook-addon, which is registered in the addons of main.ts.
// To register handlers in a story, call msw.use() inside beforeEach({ msw }).

const preview: Preview = {
  decorators: [
    // The dark variant in index.css applies to descendants of `.dark`, so add the class to body.
    withThemeByClassName<ReactRenderer>({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'body',
    }),
  ],
};

export default preview;
