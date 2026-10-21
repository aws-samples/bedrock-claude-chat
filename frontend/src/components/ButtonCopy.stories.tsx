import type { Meta } from '@storybook/react-vite';
import ButtonCopy from './ButtonCopy';

export default { component: ButtonCopy } satisfies Meta<typeof ButtonCopy>;

export const Ideal = () => <ButtonCopy text={'CopyText'} />;
