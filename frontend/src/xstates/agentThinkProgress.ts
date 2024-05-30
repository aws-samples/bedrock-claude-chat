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
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlgBswwAHAYgHd0BrMAV2oG0AGAXUVGoB7WLgAuuQfn4gAHogCMAFi4kATAA55qxQGZd89V2U6ANCACeiVQHYVOgGzqAnKp2vH866oC+3s2iw8QlJMSVhMCVZYWlEgpgIobj4kECERcUlpOQRVex0SAFYndR0teWL7eXlTCysuFVcCrlUnapL5LicC338MHAJiElD8cMjoiipqBKTpNLEJKRTsnXVrQqLnIq43e3ttM0sc6zXK6wNFRQ11ewLrex6QAP7gkgAzAlxYbAB1QQAnJi0GSwUToURgEjoV7gv7IVRNLhEWhPIKDd74T4-f5MGYpOYZRagZardbFLpOba5PaKA6ITQkNwtJT2axOXZcdSKXx+ED4QQQODSFEDIizYTzTJLRAAWnstIQ0oKJCcKtVarVOgewpeExoYvSCyyiEu8vUStuBhsuR01kMNy1fVRITCEUEUX1EsJsisRQZBRZ1kUBQMrK4BRqhx09UKnWO8JZWk2DsCIreHy+vwBHoJRoQBVU8hIFxuKvqu0UWlN6hIXDOZqZ1Wqims3O8QA */
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
