import { useReducer } from 'react';
import Toggle from './Toggle';

export const Ideal = () => {
  const [toggle, dispatch] = useReducer((v) => !v, true);
  return <Toggle value={toggle} onChange={dispatch} />;
};
