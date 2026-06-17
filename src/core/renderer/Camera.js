/**
 * Camera: Simple viewpoint container.
 * No matrices, just raw position data.
 */
export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = -10; // Standard starter position
    }
}
