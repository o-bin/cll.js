/**
 * Node: A fundamental point in the Graph.
 * Pure data structure: x, y, z.
 */
export class Node {
    constructor(x, y, z, id) {
        this.id = id || Math.random().toString(36).substr(2, 9);

        // Raw coordinates
        this.x = x;
        this.y = y;
        this.z = z;

        // Projected screen coordinates (updated by Renderer)
        this.screenX = 0;
        this.screenY = 0;

        // Depth scale factor (for "2D/3D" sizing effects if needed later)
        this.scale = 1;
    }
}
