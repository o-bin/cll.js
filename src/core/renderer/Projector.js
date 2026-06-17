/**
 * Projector: Converts 3D graph coordinates to 2D screen space.
 * Uses direct trigonometric transformation (Euler rotation) + Perspective Divide.
 * No Matrices.
 */
export class Projector {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.cx = 0;
        this.cy = 0;
        this.focalLength = 200; // Arbitrary "zoom" factor
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.cx = width / 2;
        this.cy = height / 2;
    }

    /**
     * Projects a Node from Object Space -> World Space -> Screen Space
     * Direct application of rotation formulas.
     */
    project(node, object, camera) {
        // 1. Local Rotation (Object Space)
        // Rotation Order: Z -> Y -> X (arbitrary choice for this style)
        let x = node.x;
        let y = node.y;
        let z = node.z;

        // Rotate Z
        if (object.rz !== 0) {
            const cz = Math.cos(object.rz);
            const sz = Math.sin(object.rz);
            const tx = x * cz - y * sz;
            const ty = x * sz + y * cz;
            x = tx;
            y = ty;
        }

        // Rotate Y
        if (object.ry !== 0) {
            const cy = Math.cos(object.ry);
            const sy = Math.sin(object.ry);
            const tx = x * cy - z * sy;
            const tz = x * sy + z * cy;
            x = tx;
            z = tz;
        }

        // Rotate X
        if (object.rx !== 0) {
            const cx = Math.cos(object.rx);
            const sx = Math.sin(object.rx);
            const ty = y * cx - z * sx;
            const tz = y * sx + z * cx;
            y = ty;
            z = tz;
        }

        // 2. World Space Translation
        // Apply object position
        x += object.x;
        y += object.y;
        z += object.z;

        // 3. Camera Transform (View Space)
        // Ideally we subtract camera position. 
        // For simplicity: Camera is at (0, 0, -camera.z) looking at +Z
        // So we shift everything by -camera params.
        x -= camera.x;
        y -= camera.y;
        z -= camera.z;

        // 4. Perspective Projection
        // Simple perspective divide: screenX = x * (focal / z)
        // We need z > 0 to be in front of camera (assuming camera looks down +Z)
        // Or if camera is at +Z looking at -Z, math flips.

        // Let's assume standard: Camera at (0,0,-10), looking at (0,0,0). Objects are at 0.
        // So relative Z (depth) = z_object - z_camera.
        // if camera.z is -10, object at 0 has depth 10.

        const depth = z;

        if (depth > 0) {
            const scale = this.focalLength / depth;
            node.screenX = this.cx + x * scale;
            node.screenY = this.cy - y * scale; // Flip Y for canvas
            node.scale = scale; // Store for line width scaling if needed
        } else {
            // Behind camera
            node.scale = -1;
        }
    }
}
