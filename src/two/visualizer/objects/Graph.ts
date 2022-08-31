import { Coord } from '../../../types';
import BaseObject from '../BaseObject';
import Scene from '../Scene';
import { GRAPH_STEP } from '../constants';
import { isUndef } from '../../../util';

const EPSILON = 0.01;
const MAX_VAL = 4;

export class Graph extends BaseObject {
    absMin: number;
    absMax: number;
    asymptotes: Record<number, boolean> = {};
    constructor(scene: Scene, private fn: (x: number) => number, range: Coord) {
        super(scene);
        for (let x = range[0] - GRAPH_STEP; x <= range[1] + GRAPH_STEP * 2; x += GRAPH_STEP) {
            const y = fn(x);
            if (!isUndef(y) && Math.abs(y) < MAX_VAL) this.points.push([x, y]);
            else this.asymptotes[x - GRAPH_STEP] = true;
        }
        const vals = this.points.map(x => x[1]);
        this.absMin = Math.min(...vals);
        this.absMax = Math.max(...vals);
    }

    render(color = 'black') {
        let hasStarted = false;
        const { ctx } = this.scene;
        ctx.strokeStyle = color;
        for (let i = 0; i < this.points.length; i++) {
            if (!hasStarted) {
                ctx.beginPath();
                ctx.moveTo(...this.points[i]);
                hasStarted = true;
            } else {
                ctx.lineTo(...this.points[i]);
                if (this.asymptotes[this.points[i][0]]) {
                    ctx.stroke();
                    hasStarted = false;
                }
            }
        }
        ctx.stroke();
    }

    slope(x: number) {
        return (this.fn(x + EPSILON) - this.fn(x)) / EPSILON;
    }

    getPoints(a: number, b: number) {
        return this.points.filter(x => x[0] >= a && x[0] <= b).map(x => x[1]);
    }

    min(a: number, b: number) {
        return Math.min(...this.getPoints(a, b));
    }

    max(a: number, b: number) {
        return Math.max(...this.getPoints(a, b));
    }
}