import type { Meta } from '@storybook/react-vite';
import InputChatContent from './InputChatContent';
import { useState } from 'react';

export default {
  component: InputChatContent,
  decorators: [
    (Story) => (
      // The regenerate/continue buttons are positioned 56px above the input
      // (`-top-14`), so leave room for them.
      <div className="pt-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputChatContent>;

const defaultProps = {
  reasoningEnabled: false,
  onChangeReasoning: () => {},
  supportReasoning: true,
  isLoading: false,
  isNewChat: false,
  onSend: () => {},
  onRegenerate: () => {},
  continueGenerate: () => {},
};

export const Ideal = () => {
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  return (
    <InputChatContent
      {...defaultProps}
      canRegenerate={false}
      canContinue={false}
      reasoningEnabled={reasoningEnabled}
      onChangeReasoning={() => setReasoningEnabled(!reasoningEnabled)}
    />
  );
};

export const IdealLoading = () => {
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  return (
    <InputChatContent
      {...defaultProps}
      canRegenerate={false}
      canContinue={false}
      reasoningEnabled={reasoningEnabled}
      onChangeReasoning={() => setReasoningEnabled(!reasoningEnabled)}
      isLoading={true}
    />
  );
};

export const IdealDisabled = () => {
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  return (
    <InputChatContent
      {...defaultProps}
      canRegenerate={false}
      canContinue={false}
      reasoningEnabled={reasoningEnabled}
      onChangeReasoning={() => setReasoningEnabled(!reasoningEnabled)}
      disabled={true}
    />
  );
};

export const WithRegenerate = () => {
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  return (
    <InputChatContent
      {...defaultProps}
      canRegenerate={true}
      canContinue={false}
      reasoningEnabled={reasoningEnabled}
      onChangeReasoning={() => setReasoningEnabled(!reasoningEnabled)}
    />
  );
};

export const WithContinue = () => {
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  return (
    <InputChatContent
      {...defaultProps}
      canRegenerate={true}
      canContinue={true}
      reasoningEnabled={reasoningEnabled}
      onChangeReasoning={() => setReasoningEnabled(!reasoningEnabled)}
    />
  );
};
