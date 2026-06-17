import { CanvasRenderer } from './renderer/CanvasRenderer.js';
import { Projector } from './renderer/Projector.js';
import { Camera } from './renderer/Camera.js';

export class Engine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found.`);
        }

        this.renderer = new CanvasRenderer(this.canvas);
        this.projector = new Projector();
        this.camera = new Camera();

        // Default Settings
        this.camera.z = -5;
        this.projector.focalLength = 400;

        this.scene = [];
        this.modules = [];
        this.isRunning = false;

        this._boundLoop = this._loop.bind(this);
        this._boundResize = this._resize.bind(this);

        window.addEventListener('resize', this._boundResize);
        this._resize();
    }

    registerModule(module) {
        this.modules.push(module);
        if (module.onStart) module.onStart(this);
    }

    add(graphObject) {
        this.scene.push(graphObject);
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this._loop();
        }
    }

    stop() {
        this.isRunning = false;
    }

    _resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setSize(width, height);
        this.projector.setSize(width, height);
    }

    _loop() {
        if (!this.isRunning) return;

        const time = performance.now();

        // 1. Module Hook: onUpdate
        this.modules.forEach(m => {
            if (m.onUpdate) m.onUpdate(time, this.scene, this.camera);
        });

        // 2. Core Projection (The "Untouchable" logic)
        this.scene.forEach(obj => {
            // Optional: Internal object update if needed
            if (obj.update) obj.update();

            obj.nodes.forEach(node => {
                this.projector.project(node, obj, this.camera);
            });
        });

        // 3. Module Hook: onBeforeRender (e.g., Clear Screen)
        // If no module handles clearing, we should probably do a default clear or ensure a module does it.
        // For now, let's assume a module or the renderer does it.
        // Actually, let's make the renderer clear accessible via a module or default.
        // Let's iterate.

        this.modules.forEach(m => {
            if (m.onBeforeRender) m.onBeforeRender(this.renderer, this.scene, this.camera);
        });

        // 4. Module Hook: onRender (e.g., Draw Faces, Draw Wireframes)
        this.modules.forEach(m => {
            if (m.onRender) m.onRender(this.renderer, this.scene, this.camera);
        });

        // 5. Module Hook: onAfterRender (e.g., Post-processing, UI)
        this.modules.forEach(m => {
            if (m.onAfterRender) m.onAfterRender(this.renderer, this.scene, this.camera);
        });

        requestAnimationFrame(this._boundLoop);
    }
}
