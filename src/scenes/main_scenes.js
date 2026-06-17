import { CubeScene } from './CubeScene.js';
import { TriangleScene } from './TriangleScene.js';
import { ColorfulCubeScene } from './ColorfulCubeScene.js';
import { PencilScene } from './PencilScene.js';
import { PencilDimensional } from './PencilDimensional.js';

/**
 * Scene Configuration
 * Change 'ActiveScene' to configure the app.
 * Modules are now defined WITHIN each scene class via getModules().
 */

// --- SELECT ACTIVE SCENE HERE ---
// export const ActiveScene = PencilDimensional;
// export const ActiveScene = PencilScene;
 export const ActiveScene = ColorfulCubeScene;
// export const ActiveScene = CubeScene;
// export const ActiveScene = TriangleScene;
