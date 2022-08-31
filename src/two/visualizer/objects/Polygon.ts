import { Coord } from '../../../types';
import BaseObject from '../BaseObject';
import Scene from '../Scene';

export class Polygon extends BaseObject {
    constructor(scene: Scene, public points: Coord[]) {
        super(scene);
    }

    render(config: { fill?: string; stroke?: string; opacity?: number; }) {
        const { ctx } = this.scene;
        ctx.beginPath();
        ctx.moveTo(...this.points[0]);
        for (const c of this.points.slice(1)) ctx.lineTo(...c);
        ctx.lineTo(...this.points[0]);
        if (config.fill) {
            ctx.globalAlpha = config.opacity || 1;
            ctx.fillStyle = config.fill;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        if (config.stroke) {
            ctx.strokeStyle = config.stroke;
            ctx.stroke();
        }
    }
}

export class Rect extends Polygon {
    constructor(scene: Scene, x: number, y: number, w: number, h: number) {
        super(scene, [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h],
        ]);
    }
}