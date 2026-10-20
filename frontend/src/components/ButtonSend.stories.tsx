import type { Meta } from '@storybook/react-vite';
import ButtonSend from './ButtonSend';

export default { component: ButtonSend } satisfies Meta<typeof ButtonSend>;

export const Ideal = () => <ButtonSend onClick={() => {}} />;

export const Loading = () => <ButtonSend loading onClick={() => {}} />;

export const Diabled = () => <ButtonSend disabled onClick={() => {}} />;
