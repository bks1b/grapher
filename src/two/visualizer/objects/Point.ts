import { Coord } from '../../../types';
import { format } from '../../../util';
import BaseObject from '../BaseObject';
import Scene from '../Scene';
import { LabelConfig } from '../types';

const RADIUS = 0.05;

export class Point extends BaseObject {
    constructor(scene: Scene, private coords: Coord) {
        super(scene);
        this.points = [-1, 1].map(c => <Coord>coords.map(n => n + RADIUS * c));
    }

    render(config: LabelConfig = {}) {
        const { ctx } = this.scene;
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc(...this.coords, RADIUS, 0, Math.PI * 2);
        ctx.fill();
        if (config.label !== false) this.scene.createLabel(
            `(${config.x || format(this.coords[0])},${config.y || format(this.coords[1])})`,
            (w, h) => [this.coords[0] - w / 2, this.coords[1] - h * 3 / 2],
        );
    }
}