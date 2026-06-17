import { GraphObject } from '../core/graph/GraphObject.js';
import { Node } from '../core/graph/Node.js';
import { Edge } from '../core/graph/Edge.js';
import { FaceRenderingModule } from '../cll_module/FaceRenderingModule.js';
import { MouseControlModule } from '../cll_module/MouseControlModule.js';

export class TriangleScene extends GraphObject {
    constructor() {
        super();
        this._build();
    }

    getModules() {
        return [
            new MouseControlModule(),
            new FaceRenderingModule()
        ];
    }

    _build() {
        // Pyramid
        // Top Tip
        const top = this.addNode(new Node(0, 1, 0));

        // Base
        const b1 = this.addNode(new Node(-1, -1, 1));
        const b2 = this.addNode(new Node(1, -1, 1));
        const b3 = this.addNode(new Node(1, -1, -1));
        const b4 = this.addNode(new Node(-1, -1, -1));

        // Connections to Top
        this.addEdge(new Edge(top, b1));
        this.addEdge(new Edge(top, b2));
        this.addEdge(new Edge(top, b3));
        this.addEdge(new Edge(top, b4));

        // Base connections
        this.addEdge(new Edge(b1, b2));
        this.addEdge(new Edge(b2, b3));
        this.addEdge(new Edge(b3, b4));
        this.addEdge(new Edge(b4, b1));
    }

    update() {
        this.ry -= 0.02; // Spin other way
        this.rx += 0.01;
    }
}
