/**
 * Edge: A connection between two Nodes.
 * Pure relational data.
 */
export class Edge {
    constructor(nodeA, nodeB) {
        this.a = nodeA;
        this.b = nodeB;
    }
}
