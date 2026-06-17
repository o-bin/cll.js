/**
 * GraphObject: A collection of Nodes and Edges.
 * Manages its own local transformation data (position, rotation).
 */
export class GraphObject {
    constructor() {
        this.nodes = [];
        this.edges = [];

        // Position
        this.x = 0;
        this.y = 0;
        this.z = 0;

        // Rotation (Euler angles in radians)
        this.rx = 0;
        this.ry = 0;
        this.rz = 0;

        // Scale
        this.sx = 1;
        this.sy = 1;
        this.sz = 1;

        // Visual Style (Default)
        this.style = {
            drawEdges: true,
            edgeColor: '#000000',
            edgeWidth: 1
        };
    }

    addNode(node) {
        this.nodes.push(node);
        return node;
    }

    addEdge(edge) {
        this.edges.push(edge);
        return edge;
    }
}

export class Node {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.screenX = 0;
        this.screenY = 0;
        this.scale = 0;
    }
}

export class Edge {
    constructor(nodeA, nodeB) {
        this.a = nodeA;
        this.b = nodeB;
    }
}
