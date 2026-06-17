export class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clear() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Default wireframe renderer
    render(scene, camera) {
        // this.clear(); // Removing auto-clear to allow layering

        const objects = Array.isArray(scene) ? scene : scene.objects;
        if (!objects) return;

        this.ctx.strokeStyle = '#000000';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        objects.forEach(obj => {
            // Edges
            this.ctx.beginPath();
            obj.edges.forEach(edge => {
                const startNode = edge.a;
                const endNode = edge.b;

                // Simple clipping: check if nodes are in front of camera
                if (startNode.scale > 0 && endNode.scale > 0) {
                    // Dynamic line width based on depth?
                    // this.ctx.lineWidth = 2 * ((startNode.scale + endNode.scale) / 2);
                    this.ctx.lineWidth = 1.5;

                    this.ctx.moveTo(startNode.screenX, startNode.screenY);
                    this.ctx.lineTo(endNode.screenX, endNode.screenY);
                }
            });
            this.ctx.stroke();

            // Nodes (Optional Style: "Joints")
            // this.ctx.fillStyle = '#000000';
            // obj.nodes.forEach(node => {
            //     if(node.scale > 0) {
            //         this.ctx.beginPath();
            //         this.ctx.arc(node.screenX, node.screenY, 3 * node.scale, 0, Math.PI * 2);
            //         this.ctx.fill();
            //     }
            // });
        });
    }
}
