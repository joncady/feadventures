/** Real persisted acknowledgement for tests exercising returning-player flows.
 * Onboarding tests explicitly use empty storage instead. */
export function returningPlayerStorageState(origin = 'http://127.0.0.1:4173') {
  return {
    cookies: [],
    origins: [{
      origin,
      localStorage: [{ name: 'feadventures:first-time-controls:v1', value: JSON.stringify({ status: 'completed' }) }],
    }],
  };
}
