/**
 * PencilDimensional Scene
 * A scene for 3D sketching using the DrawDimensity module.
 * Allows "sketching in air" by rotating the view.
 */
import { GraphObject } from '../core/graph/GraphObject.js';
import { FaceRenderingModule } from '../cll_module/FaceRenderingModule.js';
import { MouseControlModule } from '../cll_module/MouseControlModule.js';
import { DrawDimensity } from '../cll_module/DrawDimensity.js';

export class PencilDimensional extends GraphObject {
    constructor() {
        super();
        this.faces = []; // No faces, just 3D lines
        this._build();
    }

    _build() {
        // Start empty for free 3D drawing

        // Remove default GraphObject styles so Module configuration takes precedence
        this.style = {};
    }

    getModules() {
        return [
            // Left Click (0) to Rotate
            new MouseControlModule({ mouseButton: 0 }),

            // Right Click (2) to Draw in 3D
            new DrawDimensity({ mouseButton: 2, drawSpeed: 10 }),

            // Rendering Logic (Black Lines)
            new FaceRenderingModule({
                drawEdges: true,
                edgeColor: '#000000',
                edgeWidth: 3
            })
        ];
    }
}
