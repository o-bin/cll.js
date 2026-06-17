import { GraphObject } from '../core/graph/GraphObject.js';
import { Node } from '../core/graph/Node.js';
import { Edge } from '../core/graph/Edge.js';
import { FaceRenderingModule } from '../cll_module/FaceRenderingModule.js';
import { MouseControlModule } from '../cll_module/MouseControlModule.js';

export class ColorfulCubeScene extends GraphObject {
    constructor() {
        super();
        this.faces = []; // Initialize faces array

        // Custom Style for this Scene
        this.style = {
            drawEdges: true,
            edgeColor: '#000000',
            edgeWidth: 1 // Thick lines as requested
        };

        this._build();
    }

    getModules() {
        return [
            new MouseControlModule(),
            new FaceRenderingModule({
                drawEdges: true,
                edgeColor: '#000000',
                edgeWidth: 1
            })
        ];
    }

    _build() {
        // Define Cube Vertices (Nodes)
        const size = 1.5;
        // Front
        const n1 = this.addNode(new Node(-size, -size, size));
        const n2 = this.addNode(new Node(size, -size, size));
        const n3 = this.addNode(new Node(size, size, size));
        const n4 = this.addNode(new Node(-size, size, size));
        // Back
        const n5 = this.addNode(new Node(-size, -size, -size));
        const n6 = this.addNode(new Node(size, -size, -size));
        const n7 = this.addNode(new Node(size, size, -size));
        const n8 = this.addNode(new Node(-size, size, -size));

        // Define Faces (Nodes + Color)
        // Order matters for "winding", but for Painter's algo with simple sorting, just listing them is enough.

        // Front (Red)
        this.addFace([n1, n2, n3, n4], '#FF0000');
        // Back (Cyan)
        this.addFace([n6, n5, n8, n7], '#00FFFF');
        // Top (Green)
        this.addFace([n4, n3, n7, n8], '#00FF00');
        // Bottom (Magenta)
        this.addFace([n1, n5, n6, n2], '#FF00FF');
        // Right (Blue)
        this.addFace([n2, n6, n7, n3], '#0000FF');
        // Left (Yellow)
        this.addFace([n5, n1, n4, n8], '#FFFF00');

        // Edges (For WireframeModule)
        this.addEdge(new Edge(n1, n2));
        this.addEdge(new Edge(n2, n3));
        this.addEdge(new Edge(n3, n4));
        this.addEdge(new Edge(n4, n1));

        this.addEdge(new Edge(n5, n6));
        this.addEdge(new Edge(n6, n7));
        this.addEdge(new Edge(n7, n8));
        this.addEdge(new Edge(n8, n5));

        this.addEdge(new Edge(n1, n5));
        this.addEdge(new Edge(n2, n6));
        this.addEdge(new Edge(n3, n7));
        this.addEdge(new Edge(n4, n8));
    }

    addFace(nodes, color) {
        this.faces.push({ nodes, color });
    }

    update() {
    this.ry += 0.01;
    this.rx += 0.005;
    }
}
