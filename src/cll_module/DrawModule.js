/**
 * DrawModule
 * Allows the user to paint lines in 3D space relative to the object.
 * Controls:
 * - Right Click + Drag: Draw Line
 */
import { Node, Edge } from '../core/graph/GraphObject.js';

export class DrawModule {
    constructor(options = {}) {
        this.name = 'DrawModule';
        this.mouseButton = options.mouseButton !== undefined ? options.mouseButton : 2; // Default: Right Click (2)
        this.isDrawing = false;
        this.lastNode = null;
        this.drawSpeed = options.drawSpeed || 20; // Min distance pixels to create new node
        this.lastX = 0;
        this.lastY = 0;
    }

    onStart(engine) {
        this.canvas = engine.canvas;
        this.engine = engine;

        // Prevent Context Menu on Right Click if we are using Right Click
        if (this.mouseButton === 2) {
            this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === this.mouseButton) {
                this.isDrawing = true;
                this.startStroke(e.clientX, e.clientY);
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === this.mouseButton) {
                this.isDrawing = false;
                this.lastNode = null;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                this.continueStroke(e.clientX, e.clientY);
            }
        });
    }

    startStroke(screenX, screenY) {
        // Fix: engine.scene is an array. We take the first one (active scene).
        const scene = this.engine.scene[0];
        if (!scene) return;

        const point = this.getIntersection(screenX, screenY, scene);
        if (!point) return;

        const newNode = new Node(point.x, point.y, 0);

        scene.addNode(newNode);
        this.lastNode = newNode;
        this.lastX = screenX;
        this.lastY = screenY;
    }

    continueStroke(screenX, screenY) {
        const dist = Math.hypot(screenX - this.lastX, screenY - this.lastY);
        if (dist < this.drawSpeed) return;

        const scene = this.engine.scene[0];
        if (!scene) return;

        const point = this.getIntersection(screenX, screenY, scene);
        if (!point) return;

        const newNode = new Node(point.x, point.y, 0);

        scene.addNode(newNode);

        if (this.lastNode) {
            const newEdge = new Edge(this.lastNode, newNode);
            scene.addEdge(newEdge);
        }

        this.lastNode = newNode;
        this.lastX = screenX;
        this.lastY = screenY;
    }

    /**
     * Calculates the intersection point between the mouse ray and the object's Z=0 plane.
     * Returns point in Object Local Space {x, y}.
     */
    getIntersection(screenX, screenY, object) {
        const projector = this.engine.projector;
        const camera = this.engine.camera;

        // 1. Calculate Normalized Device Coordinates (NDC) / View Plane Coordinates
        // Projector Logic: screenX = cx + x * (focal / z)
        // Ray Dir View Space:
        // x = (screenX - cx) / focal
        // y = -(screenY - cy) / focal  <-- Note the FLIP here to match Projector's Y flip
        // z = 1 (forward)

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = screenX - rect.left;
        const mouseY = screenY - rect.top;

        // View Plane at z = 1 logic (conceptually)
        // The Projector uses specific focal length mapping.
        // Let's deduce the Ray Vector (Dir).
        const dirX = (mouseX - projector.cx) / projector.focalLength;
        const dirY = -(mouseY - projector.cy) / projector.focalLength;
        const dirZ = 1;

        // Ray Origin (Camera)
        const ro = { x: camera.x, y: camera.y, z: camera.z };

        // Ray Direction (Normalized)
        const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        const rd = { x: dirX / len, y: dirY / len, z: dirZ / len };

        // 2. Define Plane (Object Local Z=0)
        // Plane Center (World Space)
        const pc = { x: object.x, y: object.y, z: object.z };

        // Plane Normal (Object Local Z axis rotated to World)
        // Rotation Order: Z -> Y -> X
        // Normal is simply the 3rd column of the rotation matrix (Rotation of 0,0,1)

        const planeNormal = {
            x: -Math.sin(object.ry),
            y: -Math.cos(object.ry) * Math.sin(object.rx),
            z: Math.cos(object.ry) * Math.cos(object.rx)
        };

        // 3. Ray-Plane Intersection
        // t = dot(pc - ro, pn) / dot(rd, pn)

        const dotRdPn = rd.x * planeNormal.x + rd.y * planeNormal.y + rd.z * planeNormal.z;
        if (Math.abs(dotRdPn) < 1e-6) return null; // Parallel

        const diff = { x: pc.x - ro.x, y: pc.y - ro.y, z: pc.z - ro.z };
        const dotDiffPn = diff.x * planeNormal.x + diff.y * planeNormal.y + diff.z * planeNormal.z;

        const t = dotDiffPn / dotRdPn;
        if (t < 0) return null; // Behind camera

        const intersect = {
            x: ro.x + rd.x * t,
            y: ro.y + rd.y * t,
            z: ro.z + rd.z * t
        };

        // 4. Inverse Transform to Local Space
        // World -> Local
        // Local = InvRot(Intersect - ObjectPos)

        let dx = intersect.x - object.x;
        let dy = intersect.y - object.y;
        let dz = intersect.z - object.z;

        // Inverse Rotation Order: Inv X -> Inv Y -> Inv Z
        // Inverse of Rot(theta) is Rot(-theta)

        // Inv X
        let rx = -object.rx;
        let cx = Math.cos(rx), sx = Math.sin(rx);
        let ty = dy * cx - dz * sx;
        let tz = dy * sx + dz * cx;
        dy = ty; dz = tz;

        // Inv Y
        let ry = -object.ry;
        let cy = Math.cos(ry), sy = Math.sin(ry);
        let tx = dx * cy - dz * sy;
        tz = dx * sy + dz * cy; // Reuse tz
        dx = tx; dz = tz;

        // Inv Z
        let rz = -object.rz;
        let cz = Math.cos(rz), sz = Math.sin(rz);
        tx = dx * cz - dy * sz; // Reuse tx
        ty = dx * sz + dy * cz; // Reuse ty
        dx = tx; dy = ty;

        return { x: dx, y: dy };
    }
}
