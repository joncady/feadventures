/** Read-only browser harness helper. Import the exact entry loaded by this document.
 * Vite may append ?t= after a local edit; importing bare /src/main.ts then creates
 * a second Phaser instance. Never use this helper to alter gameplay state.
 */
export async function runningGame() {
  const entry = document.querySelector('script[type="module"][src*="/src/main.ts"]');
  if (!entry?.src) throw new Error('The running game module entry is not available.');
  return (await import(entry.src)).game;
}
