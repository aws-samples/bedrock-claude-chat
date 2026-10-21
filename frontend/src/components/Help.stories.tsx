import type { Meta } from '@storybook/react-vite';
import { TooltipDirection } from '../constants';
import Help from './Help';

export default {
  component: Help,
  decorators: [
    (Story) => (
      // Tooltip aligns to the edges of its wrapper, so center the story to
      // leave room on both sides for the tooltip.
      <div className="flex justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Help>;

export const Right = () => (
  <div className="flex items-center gap-1">
    Help is shown on the right
    <Help direction={TooltipDirection.RIGHT} message="Help text" />
  </div>
);

export const Left = () => (
  <div className="flex items-center gap-1">
    Help is shown on the left
    <Help direction={TooltipDirection.LEFT} message="Help text" />
  </div>
);
