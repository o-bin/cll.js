import { GraphObject } from '../core/graph/GraphObject.js';
import { Node } from '../core/graph/Node.js';
import { Edge } from '../core/graph/Edge.js';
import { FaceRenderingModule } from '../cll_module/FaceRenderingModule.js';
import { MouseControlModule } from '../cll_module/MouseControlModule.js';

export class CubeScene extends GraphObject {
    constructor() {
        super();
        this.style = {
            drawEdges: true,
            edgeColor: '#000000',
            edgeWidth: 3 // Thick lines as requested
        };

        this._build();
    }

    getModules() {
        return [
            new MouseControlModule(),
            new FaceRenderingModule() // Fallback to wireframe
        ];
    }

    _build() {
        // Define Cube Vertices (Nodes) - Raw Coordinates
        // Front Face
        const n1 = this.addNode(new Node(-1, -1, 1));
        const n2 = this.addNode(new Node(1, -1, 1));
        const n3 = this.addNode(new Node(1, 1, 1));
        const n4 = this.addNode(new Node(-1, 1, 1));
        // Back Face
        const n5 = this.addNode(new Node(-1, -1, -1));
        const n6 = this.addNode(new Node(1, -1, -1));
        const n7 = this.addNode(new Node(1, 1, -1));
        const n8 = this.addNode(new Node(-1, 1, -1));

        // Define Connection (Edges)
        // Front Face
        this.addEdge(new Edge(n1, n2));
        this.addEdge(new Edge(n2, n3));
        this.addEdge(new Edge(n3, n4));
        this.addEdge(new Edge(n4, n1));
        // Back Face
        this.addEdge(new Edge(n5, n6));
        this.addEdge(new Edge(n6, n7));
        this.addEdge(new Edge(n7, n8));
        this.addEdge(new Edge(n8, n5));
        // Connecting Edges
        this.addEdge(new Edge(n1, n5));
        this.addEdge(new Edge(n2, n6));
        this.addEdge(new Edge(n3, n7));
        this.addEdge(new Edge(n4, n8));
    }

    // Custom update for animation
    update() {
        this.ry += 0.01;
        this.rx += 0.005;
    }
}
