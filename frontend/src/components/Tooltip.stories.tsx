import type { Meta } from '@storybook/react-vite';
import { PiQuestionFill } from 'react-icons/pi';
import Tooltip from './Tooltip';

export default { component: Tooltip } satisfies Meta<typeof Tooltip>;

export const Ideal = () => (
  <Tooltip message="message">
    <PiQuestionFill />
  </Tooltip>
);
