import type { Meta } from '@storybook/react-vite';
import ReasoningCard from './ReasoningCard';

export default { component: ReasoningCard } satisfies Meta<
  typeof ReasoningCard
>;

export const Ideal = () => (
  <ReasoningCard content="This is the content of the reasoning card." />
);
