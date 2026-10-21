import type { Meta } from '@storybook/react-vite';
import { useReducer } from 'react';
import Toggle from './Toggle';

export default { component: Toggle } satisfies Meta<typeof Toggle>;

export const Ideal = () => {
  const [toggle, dispatch] = useReducer((v) => !v, true);
  return <Toggle value={toggle} onChange={dispatch} />;
};
