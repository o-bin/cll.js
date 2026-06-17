/**
 * WireframeModule
 * Draws the edges of the graph objects with configurable thickness and color.
 */
export class WireframeModule {
    constructor(options = {}) {
        this.name = 'WireframeRenderer';
        this.color = options.color || '#000000';
        this.lineWidth = options.lineWidth || 1.5;
    }

    onRender(renderer, scene, camera) {
        const ctx = renderer.ctx;

        // We do NOT call renderer.render() because we want custom styling.
        // We implement the edge drawing here.

        const objects = Array.isArray(scene) ? scene : scene.objects;
        if (!objects) return;

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        objects.forEach(obj => {
            // Edges
            ctx.beginPath();
            obj.edges.forEach(edge => {
                const startNode = edge.a;
                const endNode = edge.b;

                // Simple clipping: check if nodes are in front of camera
                if (startNode.scale > 0 && endNode.scale > 0) {
                    ctx.moveTo(startNode.screenX, startNode.screenY);
                    ctx.lineTo(endNode.screenX, endNode.screenY);
                }
            });
            ctx.stroke();
        });
    }
}
