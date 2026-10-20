import type { Meta } from '@storybook/react-vite';
import { PiPlus } from 'react-icons/pi';
import ButtonIcon from './ButtonIcon';

export default { component: ButtonIcon } satisfies Meta<typeof ButtonIcon>;

export const Ideal = () => (
  <ButtonIcon onClick={() => {}}>
    <PiPlus />
  </ButtonIcon>
);

export const Disabled = () => (
  <ButtonIcon disabled onClick={() => {}}>
    <PiPlus />
  </ButtonIcon>
);
