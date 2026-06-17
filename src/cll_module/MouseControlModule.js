/**
 * MouseControlModule
 * Allows the user to rotate the scene objects by dragging the mouse.
 */
export class MouseControlModule {
    constructor(options = {}) {
        this.name = 'MouseControl';
        this.mouseButton = options.mouseButton !== undefined ? options.mouseButton : 0; // Default: Left Click (0)
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.targetScene = null;
    }

    onStart(engine) {
        this.engine = engine; // Store engine reference
        const canvas = engine.canvas;

        // Rotation Logic
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === this.mouseButton) {
                this.isDragging = true;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.lastX;
            const deltaY = e.clientY - this.lastY;

            this.lastX = e.clientX;
            this.lastY = e.clientY;

            // Apply rotation to all objects in the scene
            if (this.targetScene) {
                this.targetScene.forEach(obj => {
                    obj.ry += deltaX * 0.01;
                    obj.rx += deltaY * 0.01;
                });
            }
        });

        // Zoom Logic
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            // Scroll down (positive) = Zoom Out (Make Z more negative)
            // Scroll up (negative) = Zoom In (Make Z less negative/more positive)

            // engine.camera.z starts at -5.
            // We want to move it further negative to zoom out.
            const zoomSpeed = 2.5;
            const delta = Math.sign(e.deltaY) * zoomSpeed;

            this.engine.camera.z -= delta;

            // Optional: Clamp zoom?
            // if (this.engine.camera.z > -1) this.engine.camera.z = -1;
            // if (this.engine.camera.z < -100) this.engine.camera.z = -100;
        }, { passive: false });
    }

    onUpdate(time, scene, camera) {
        // Keep a reference to the scene for the event listener
        this.targetScene = scene;
    }
}
