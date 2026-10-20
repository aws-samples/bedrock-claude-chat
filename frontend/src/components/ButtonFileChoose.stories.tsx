import type { Meta } from '@storybook/react-vite';
import { TbPhotoPlus } from 'react-icons/tb';
import ButtonFileChoose from './ButtonFileChoose';

export default { component: ButtonFileChoose } satisfies Meta<
  typeof ButtonFileChoose
>;

export const Ideal = () => (
  <ButtonFileChoose className="w-10" icon onChange={() => {}}>
    <TbPhotoPlus />
  </ButtonFileChoose>
);
