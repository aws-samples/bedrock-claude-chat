import { setup, assign } from 'xstate';

export const AgentState = {
  SLEEPING: 'sleeping',
  THINKING: 'thinking',
  LEAVING: 'leaving',
} as const;

export type AgentState = (typeof AgentState)[keyof typeof AgentState];

export type AgentThinkingEvent =
  | { type: 'wakeup' }
  | { type: 'go-on' }
  | { type: 'goodbye' };

export type AgentThinkingEventKeys = AgentThinkingEvent['type'];

export const agentThinkingState = setup({
  types: {
    context: {} as { count: number },
    events: {} as AgentThinkingEvent,
  },
  actions: {
    reset: assign({ count: () => 0 }),
    counter: assign({
      count: ({ context }) => context.count + 1,
    }),
    close: assign({
      count: () => 100,
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlgBswwAHAqAYgHd0BrMAV2oG0AGAXUShqAe1i4ALrmH5BIAB6IAjADYATCQDsKxQBZVAZmUBWHqY06ANCACeiVRp4lDADgCcixT3fLnyxQF9-KzQsPEJScTCWOnooYQBaaV4BJBARMUlpWQUEe2cSHS19fVdVVRV3IytbXNMSAxNFIyMtVT9lDUDgjBwCYhJIgmj8BjjhCAAjazBk2XSJKRlUnJL8xXd9cx4-DQ1nVWq7XZIdxS0ddbajHSMukBDe8JJKdAA3GLlYcXRxMBJ0ABmvwATshVCYeER6A8wv0Xu8RrNUvNMktQCtXGsNlsdnsDjZEM5FE4yq4vPsdModPtlIEgiB8OM4LIYX0iHNRAssstEPFlIcEPEjCRXKKxeLxfo7qynhQqLQRhyMotsog9ALnMKWooiUZ9M59opNrT6TL+oN8MMoEquWj5HYiZpvIV9lpFOCNAL9HUTK4NMZvWdXPoAqaerDSPC6DbUaqEHr1Dw9jwiTwdSm9hr8kn001jcoqbc6UA */
  context: {
    count: 0,
  },
  initial: 'sleeping',
  states: {
    sleeping: {
      on: {
        wakeup: {
          actions: 'reset',
          target: 'thinking',
        },
      },
    },
    thinking: {
      on: {
        'go-on': [
          {
            actions: 'counter',
          },
        ],
        goodbye: {
          actions: 'close',
          target: 'leaving',
        },
      },
    },
    leaving: {
      after: {
        2500: { target: 'sleeping' },
      },
    },
  },
});
