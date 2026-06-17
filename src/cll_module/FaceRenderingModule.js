/**
 * FaceRenderingModule
 * Responsible for rendering filled faces of GraphObjects.
 * Uses Painter's Algorithm (Z-sorting) to handle occlusion.
 */
export class FaceRenderingModule {
    constructor(options = {}) {
        this.name = 'FaceRenderer';
        this.drawEdges = options.drawEdges || false;
        this.edgeColor = options.edgeColor || '#000000';
        this.edgeWidth = options.edgeWidth || 1;
    }

    onBeforeRender(renderer, scene, camera) {
        // Clear the canvas before we start drawing
        renderer.clear();
    }

    onRender(renderer, scene, camera) {
        const ctx = renderer.ctx;
        const allFaces = [];

        // 1. Collect all faces from all objects
        scene.forEach(obj => {
            // Ensure faces array exists
            if (!obj.faces) obj.faces = [];

            obj.faces.forEach(face => {
                // Calculate average Z (depth) of the face for sorting
                // valid nodes only (scale > 0 means in front of camera)
                let visibleNodes = 0;
                let zSum = 0;

                // We use the 'z' coordinate from the object space transformed to world/camera space?
                // The Projector transforms nodes. 
                // Wait, Projector modifies node.screenX/Y and node.scale.
                // It DOES NOT store the projected Z in a persistent "depth" property on the node easily accessible here 
                // without re-calculation or storing it.
                // However, Projector stores `node.scale = focal / depth`.
                // So `depth = focal / node.scale`. 
                // Larger scale = closer (smaller depth).
                // Smaller scale = farther (larger depth).

                // Painter's algorithm: Draw farthest first.
                // So we want to sort by Depth Descending (Large Z to Small Z).
                // Or Scale Ascending (Small Scale to Large Scale).

                let scaleSum = 0;
                face.nodes.forEach(node => {
                    if (node.scale > 0) {
                        visibleNodes++;
                        scaleSum += node.scale;
                    }
                });

                if (visibleNodes === face.nodes.length) { // Only draw if all nodes are visible (simple culling)
                    allFaces.push({
                        face: face,
                        obj: obj,
                        avgScale: scaleSum / visibleNodes
                    });
                }
            });

            // FALLBACK: If object has NO faces, render as Wireframe.
            console.log(`Obj ${obj.constructor.name}: Faces=${obj.faces.length}, Edges=${obj.edges ? obj.edges.length : 0}`);
            if (obj.faces.length === 0 && obj.edges && obj.edges.length > 0) {
                console.log('Rendering Wireframe...');
                this.renderWireframe(ctx, obj);
            }
        });

        // 2. Sort Faces (Painter's Algorithm)
        // Draw from back (small scale) to front (large scale)
        allFaces.sort((a, b) => a.avgScale - b.avgScale);

        // 3. Draw Faces
        allFaces.forEach(item => {
            const face = item.face;

            ctx.beginPath();
            const start = face.nodes[0];
            ctx.moveTo(start.screenX, start.screenY);

            for (let i = 1; i < face.nodes.length; i++) {
                const n = face.nodes[i];
                ctx.lineTo(n.screenX, n.screenY);
            }
            ctx.closePath();

            ctx.fillStyle = face.color || '#cccccc';
            ctx.fill();

            // Use Object Style or Module Default
            // Note: We need access to the 'obj' that 'face' belongs to.
            // Currently 'item' only has 'face'. Let's add 'obj' to the sorting item.

            const objStyle = item.obj.style || {};
            const drawEdges = objStyle.drawEdges !== undefined ? objStyle.drawEdges : this.drawEdges;
            const edgeWidth = objStyle.edgeWidth || this.edgeWidth;
            const edgeColor = objStyle.edgeColor || this.edgeColor;

            if (drawEdges) {
                ctx.lineWidth = edgeWidth;
                ctx.strokeStyle = edgeColor;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            }
        });
    }

    // Helper: Render simple wireframe for objects without faces
    renderWireframe(ctx, obj) {
        const objStyle = obj.style || {};
        const edgeWidth = objStyle.edgeWidth || this.edgeWidth;
        const edgeColor = objStyle.edgeColor || this.edgeColor;

        ctx.lineWidth = edgeWidth;
        ctx.strokeStyle = edgeColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        obj.edges.forEach(edge => {
            const startNode = edge.a;
            const endNode = edge.b;

            // Simple clipping
            if (startNode.scale > 0 && endNode.scale > 0) {
                ctx.moveTo(startNode.screenX, startNode.screenY);
                ctx.lineTo(endNode.screenX, endNode.screenY);
            }
        });
        ctx.stroke();
    }
}
