import { PiPlus } from 'react-icons/pi';
import ButtonIcon from './ButtonIcon';

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
