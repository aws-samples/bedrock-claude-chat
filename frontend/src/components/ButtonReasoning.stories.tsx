import type { Meta } from '@storybook/react-vite';
import ButtonReasoning from './ButtonReasoning';
import { useState } from 'react';

export default { component: ButtonReasoning } satisfies Meta<
  typeof ButtonReasoning
>;

export const Default = () => {
  const [showReasoning, setShowReasoning] = useState(false);
  return (
    <ButtonReasoning
      showReasoning={showReasoning}
      onToggleReasoning={() => setShowReasoning(!showReasoning)}
    />
  );
};

export const IconOnly = () => {
  const [showReasoning, setShowReasoning] = useState(false);
  return (
    <ButtonReasoning
      icon
      showReasoning={showReasoning}
      onToggleReasoning={() => setShowReasoning(!showReasoning)}
    />
  );
};
