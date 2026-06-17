import { Engine } from './core/Engine.js';
import { ActiveScene } from './scenes/main_scenes.js';
import { FaceRenderingModule } from './cll_module/FaceRenderingModule.js';
import { MouseControlModule } from './cll_module/MouseControlModule.js';
// import { WireframeModule } from './cll_module/WireframeModule.js';

console.log('cll.js: Initializing Engine...');

// Initialize Engine
const engine = new Engine('main-canvas');

// Create and Add Scene
const scene = new ActiveScene();
engine.add(scene);

// Register Modules
// The scene defines its own modules (Self-Contained)
const modulesToRegister = (typeof scene.getModules === 'function')
    ? scene.getModules()
    : []; // No global fallback anymore. Scenes MUST define modules.

if (modulesToRegister.length === 0) {
    console.warn('No modules registered. Scene might be missing getModules().');
}

console.log('Registering Modules:', modulesToRegister.map(m => m.constructor.name));

modulesToRegister.forEach(module => {
    engine.registerModule(module);
});

// Start Animation Loop
engine.start();
