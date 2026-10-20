import type { Meta } from '@storybook/react-vite';
import Skeleton from './Skeleton';

export default { component: Skeleton } satisfies Meta<typeof Skeleton>;

export const Ideal = () => <Skeleton className="h-12 w-full" />;
