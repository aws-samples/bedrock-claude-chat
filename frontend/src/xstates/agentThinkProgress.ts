import { setup, assign } from 'xstate';

export type AgentThinkingEvent =
  | { type: 'wakeup' }
  | { type: 'thinking' }
  | { type: 'sleeping' };

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
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlgBswwAHAYgHd0BrMAV2oG0AGAXUVGoB7WLgAuuQfn4gAHogCMAZgCsJAEwAOeWoAsGjSrVqAbABoQAT0QmAnCR3Lj8nQHZl89zuM6Avj-NoWHiEpJiSsJgSrLC0osFMBFDcfEggQiLiktJyCGrKGiTKNgZcaqXyXMqKLi7mVgjyLsaFNk1exi7yNsYaDn4BGDgExCRh+BFRMWD4EMnS6WISUqk5JqrKOjo2Hka6XC42dYhaJIpG24pbGp6K8v0ggUMho+GRgtGx8Ykc8ikCwossitrPkWiUymoKlUakcEIouHYNC41NVig4dEZjH5-CB8IIIHBpI9gsR5gDMstQDkALRmSyIWkkLjM5mKLReVplGz3YnDUgUKjUMkZJbZRAY2G2EjGXTyeQylxcDGKbk43nPMYTd7wVILCli3IbU6OJrwpHM4yKOn1NRNEhIlEHXobTG+bFAA */
  context: {
    count: 0,
  },
  initial: 'sleep',
  states: {
    sleep: {
      on: {
        wakeup: {
          actions: 'reset',
          target: 'conscious',
        },
      },
    },
    conscious: {
      on: {
        thinking: [
          {
            actions: 'counter',
          },
        ],
        sleeping: {
          actions: 'close',
          target: 'finishWork',
        },
      },
    },
    finishWork: {
      after: {
        2500: { target: 'sleep' },
      },
    },
  },
});
