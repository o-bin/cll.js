/**
 * DrawDimensity Module
 * Allows drawing in 3D space by projecting strokes onto a view-aligned plane
 * that passes through the last active node (or object center).
 * This enables "sketching in air" by rotating the view.
 */
import { DrawModule } from './DrawModule.js';
import { Node, Edge } from '../core/graph/GraphObject.js';

export class DrawDimensity extends DrawModule {
    constructor(options = {}) {
        super(options);
        this.name = 'DrawDimensity';
    }

    /**
     * Override getIntersection to project onto a Camera-Aligned Plane
     * instead of the Object's Z=0 Plane.
     */
    getIntersection(screenX, screenY, object) {
        const projector = this.engine.projector;
        const camera = this.engine.camera;

        // 1. Calculate Ray (Same as DrawModule)
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = screenX - rect.left;
        const mouseY = screenY - rect.top;

        const dirX = (mouseX - projector.cx) / projector.focalLength;
        const dirY = -(mouseY - projector.cy) / projector.focalLength;
        const dirZ = 1;

        const ro = { x: camera.x, y: camera.y, z: camera.z };
        const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        const rd = { x: dirX / len, y: dirY / len, z: dirZ / len };

        // 2. Define Plane (View Aligned)
        // Normal: The camera's forward vector in World Space.
        // Since camera is at (0,0,-Z) looking at +Z, normal is (0,0,-1) pointing BACK at camera
        // or (0,0,1) pointing forward.
        // Let's use Normal = (0,0,1) in World Space (View Plane perpendicular to Z axis).
        // Wait, if we rotate the object, the "View Plane" is static relative to the Camera/Screen.
        // So Plane Normal in World Space is always (0, 0, 1) if camera is fixed looking down Z.

        // BUT we need the intersection point in OBJECT LOCAL SPACE.

        // Plane Point:
        // Use the last created node's WORLD position.
        // If no last node, use Object Center (World Space).

        let planePointWorld;

        if (this.lastNode) {
            // Transform lastNode (Local) to World
            // We need a helper for Local->World transform...
            // Or just do it manually here for now.
            // Rot(Local) + Pos = World
            const ln = this.lastNode;

            // Re-implement simplified rotation logic (Z->Y->X)
            let x = ln.x, y = ln.y, z = ln.z;

            // Rot Z
            let cz = Math.cos(object.rz), sz = Math.sin(object.rz);
            let tx = x * cz - y * sz, ty = x * sz + y * cz;
            x = tx; y = ty;

            // Rot Y
            let cy = Math.cos(object.ry), sy = Math.sin(object.ry);
            tx = x * cy - z * sy; let tz = x * sy + z * cy;
            x = tx; z = tz;

            // Rot X
            let cx = Math.cos(object.rx), sx = Math.sin(object.rx);
            ty = y * cx - z * sx; tz = y * sx + z * cx;
            y = ty; z = tz;

            planePointWorld = {
                x: x + object.x,
                y: y + object.y,
                z: z + object.z
            };
        } else {
            // Object Center
            planePointWorld = { x: object.x, y: object.y, z: object.z };
        }

        // Plane Normal (World Space)
        // Perpendicular to Camera (Z-axis).
        const planeNormalWorld = { x: 0, y: 0, z: 1 };

        // 3. Ray-Plane Intersection (World Space)
        const dotRdPn = rd.x * planeNormalWorld.x + rd.y * planeNormalWorld.y + rd.z * planeNormalWorld.z;
        if (Math.abs(dotRdPn) < 1e-6) return null;

        const diff = {
            x: planePointWorld.x - ro.x,
            y: planePointWorld.y - ro.y,
            z: planePointWorld.z - ro.z
        };

        const dotDiffPn = diff.x * planeNormalWorld.x + diff.y * planeNormalWorld.y + diff.z * planeNormalWorld.z;
        const t = dotDiffPn / dotRdPn;

        if (t < 0) return null;

        const intersectWorld = {
            x: ro.x + rd.x * t,
            y: ro.y + rd.y * t,
            z: ro.z + rd.z * t
        };

        // 4. World -> Local Transform
        let dx = intersectWorld.x - object.x;
        let dy = intersectWorld.y - object.y;
        let dz = intersectWorld.z - object.z;

        // Inverse Rotation (Inv X -> Inv Y -> Inv Z)

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
        tz = dx * sy + dz * cy;
        dx = tx; dz = tz;

        // Inv Z
        let rz = -object.rz;
        let cz = Math.cos(rz), sz = Math.sin(rz);
        tx = dx * cz - dy * sz;
        ty = dx * sz + dy * cz;
        dx = tx; dy = ty;

        // Return 3D Local Point!
        return { x: dx, y: dy, z: dz };
    }

    /**
     * Override startStroke to ensure we pick up the correct starting depth
     * or reset if we want a fresh start.
     * Actually, DrawModule.startStroke calls getIntersection, so our override handles it.
     * But we need to make sure we create a Node with Z.
     * DrawModule currently does `new Node(point.x, point.y, 0)`.
     * We need to override startStroke/continueStroke to accept Z.
     */

    startStroke(screenX, screenY) {
        const scene = this.engine.scene[0];
        if (!scene) return;

        // If not continuing a line (new separate stroke), we might want to start at center depth
        // UNLESS we are snapping to existing geometry (future feature).
        // For now, if we click far away, start at object Z plane? 
        // Or just use the lastNode logic (if it persists across strokes? DrawModule sets lastNode=null on mouseup).
        // So a new stroke effectively starts at Object Center depth (Z=0 plane relative to view). 
        // That's fine for now.

        const point = this.getIntersection(screenX, screenY, scene);
        if (!point) return;

        // Extend DrawModule behavior: Use Z!
        const newNode = new Node(point.x, point.y, point.z);

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

        const newNode = new Node(point.x, point.y, point.z); // Use Z!

        scene.addNode(newNode);

        if (this.lastNode) {
            const newEdge = new Edge(this.lastNode, newNode);
            scene.addEdge(newEdge);
        }

        this.lastNode = newNode;
        this.lastX = screenX;
        this.lastY = screenY;
    }
}
