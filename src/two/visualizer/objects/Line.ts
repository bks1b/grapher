import { Coord } from '../../../types';
import BaseObject from '../BaseObject';
import Scene from '../Scene';
import { SCALE } from '../constants';

const X_PADDING = 0.15;
const DASH = 0.1;

export class Line extends BaseObject {
    constructor(scene: Scene, public start: Coord, public end: Coord) {
        super(scene);
        this.points = [start, end];
    }

    render(config: {
        label?: string;
        lineWidth?: number;
        dotted?: boolean;
    } = {}) {
        const { ctx } = this.scene;
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = (config.lineWidth || 1) / SCALE;
        if (config.dotted) ctx.setLineDash([DASH, DASH]);
        ctx.moveTo(...this.start);
        ctx.lineTo(...this.end);
        ctx.stroke();
        ctx.lineWidth = 1 / SCALE;
        ctx.setLineDash([]);
        this.renderLabel(config.label);
    }

    renderLabel(label?: string) {
        this.scene.createLabel(label, (w, h) => {
            const a = Math.atan(Math.abs((this.end[1] - this.start[1]) / ((this.end[0] - this.start[0]) || 1)));
            return [
                (this.start[0] + this.end[0]) / 2 - Math.cos(a) * w / 2 + X_PADDING * Math.sin(a),
                (this.start[1] + this.end[1]) / 2 - Math.sin(a) * h / 2,
            ];
        });
    }
}