import { GraphObject } from '../core/graph/GraphObject.js';
import { Node, Edge } from '../core/graph/GraphObject.js';
import { FaceRenderingModule } from '../cll_module/FaceRenderingModule.js';
import { MouseControlModule } from '../cll_module/MouseControlModule.js';
import { DrawModule } from '../cll_module/DrawModule.js';

export class PencilScene extends GraphObject {
    constructor() {
        super();
        this.faces = []; // No faces, just lines

        // Wireframe Style
        this.style = {
            drawEdges: true,
            edgeColor: '#000000ff', // Red lines for drawing
            edgeWidth: 3
        };

        this._build();
    }

    _build() {
        // Start empty as requested ("Un Lienzo")
    }

    /**
     * Define the modules required for this scene and their configuration.
     * This allows the scene to dictate interaction and rendering behavior manually.
     */
    getModules() {
        return [
            // MANUAL CONFIGURATION: Left Click (0) to Rotate
            new MouseControlModule({ mouseButton: 0 }),

            // MANUAL CONFIGURATION: Right Click (2) to Draw
            new DrawModule({ mouseButton: 2 }),

            // Rendering Logic
            new FaceRenderingModule({
                drawEdges: true,
                edgeColor: '#000000ff',
                edgeWidth: 3
            })
        ];
    }
}
