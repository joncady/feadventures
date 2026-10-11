import Phaser from 'phaser';
import { WORLD } from '../data/config';

// Phaser 3.90 has no game-level resolution option. Supersample its native
// renderer without changing ScaleManager's logical size or input coordinates.
export const RENDER_DENSITY = 3;

export function installSharpRendering(game: Phaser.Game): void {
  const renderer = game.renderer;
  // pixelArt also installs an inline CSS rule; only source texture sampling
  // should be nearest, not the browser's reduction of the supersampled canvas.
  game.canvas.style.imageRendering = 'auto';
  let density = 2;
  const resize = () => {
    // Two samples even at DPR1 smooth small type; larger Retina windows get
    // three. Update only on resize, and bound the GPU/memory cost.
    density = Math.max(2, Math.min(RENDER_DENSITY,
      Math.ceil(game.scale.displaySize.width / WORLD.width * (window.devicePixelRatio || 1))));
    const width = WORLD.width * density, height = WORLD.height * density;
    game.canvas.width = width;
    game.canvas.height = height;
    renderer.resize(width, height);
  };
  game.scale.on(Phaser.Scale.Events.RESIZE, resize);
  resize();

  const render = renderer.render.bind(renderer);
  renderer.render = (scene, children, camera) => {
    const viewport = [camera.x, camera.y, camera.width, camera.height];
    const matrix = (camera as Phaser.Cameras.Scene2D.Camera & { matrix: Phaser.GameObjects.Components.TransformMatrix }).matrix.matrix;
    const transform = matrix.slice();
    // CameraManager already computed culling/worldView at logical resolution.
    // Only the draw operation sees physical pixels; input and gameplay never do.
    camera.setViewport(viewport[0] * density, viewport[1] * density,
      viewport[2] * density, viewport[3] * density);
    for (let i = 0; i < 6; i++) matrix[i] *= density;
    try { render(scene, children, camera); }
    finally {
      camera.setViewport(...viewport as [number, number, number, number]);
      matrix.set(transform);
    }
  };

  for (const scene of game.scene.scenes) {
    scene.sys.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, (object: Phaser.GameObjects.GameObject) => {
      if (object instanceof Phaser.GameObjects.Text) {
        object.setResolution(RENDER_DENSITY);
        // Text is antialiased; sprites/maps retain the game's nearest filtering.
        object.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    });
  }
}
