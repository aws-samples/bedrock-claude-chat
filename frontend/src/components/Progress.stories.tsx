import type { Meta } from '@storybook/react-vite';
import Progress from './Progress';

export default { component: Progress } satisfies Meta<typeof Progress>;

export const Ideal = () => <Progress />;

export const Thin = () => <Progress thin />;
export const Determinate = () => <Progress progress={80} />;
