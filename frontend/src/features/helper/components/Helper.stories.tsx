import type { Meta } from '@storybook/react-vite';
import { BottomHelper } from './BottomHelper';

export default { component: BottomHelper } satisfies Meta<typeof BottomHelper>;

export const Shortcuts = () => <BottomHelper />;
