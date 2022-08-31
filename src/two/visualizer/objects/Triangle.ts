import { Coord } from '../../../types';
import BaseObject from '../BaseObject';
import Scene from '../Scene';
import { Angle } from './Angle';
import { Line } from './Line';
import { Point } from './Point';
import { Polygon } from './Polygon';

const RIGHT_SIZE = 0.3;

const indices = [
    [1, 2],
    [2, 0],
    [0, 1],
];

export class Triangle extends BaseObject {
    sides: Line[];
    angles: Angle[];
    altitudes: Line[];
    vertices: Point[];
    constructor(scene: Scene, public points: Coord[]) {
        super(scene);
        this.sides = indices.map(i => new Line(scene, points[i[0]], points[i[1]]));
        this.angles = indices.map((i, j) => new Angle(scene, points[j], points[i[0]], points[i[1]]));
        this.altitudes = indices.map((i, j) => {
            const [x0, y0] = points[j];
            const [x1, y1] = points[i[0]];
            const [x2, y2] = points[i[1]];
            const n: number = ((x1 - x2) * (y1 - y0) - (y1 - y2) * (x1 - x0)) / ((x1 - x2) ** 2 + (y1 - y2) ** 2);
            return new Line(scene, points[j], [x0 - (y1 - y2) * n, y0 + (x1 - x2) * n]);
        });
        this.vertices = points.map(x => new Point(scene, x));
    }

    render(labels?: string[]) {
        for (let i = 0; i < this.sides.length; i++) this.sides[i].render({ label: labels?.[i] });
    }

    renderAngles(labels: (string | boolean)[], rad = 1) {
        for (let i = 0; i < labels.length; i++) if (labels[i] !== false) this.angles[i].render(<string>labels[i], rad, true);
    }

    renderAltitudes(labels: (string | false)[]) {
        for (let i = 0; i < labels.length; i++) if (labels[i] !== false) {
            this.altitudes[i].render({ label: <string>labels[i] });
            const [x, y] = this.altitudes[i].end;
            const angle = Math.atan2(...<Coord>[1, 0].map(j => this.sides[i].end[j] - this.sides[i].start[j]));
            const sin = RIGHT_SIZE * Math.sin(angle);
            const cos = RIGHT_SIZE * Math.cos(angle);
            new Polygon(this.scene, [
                this.altitudes[i].end,
                [x + sin, y - cos],
                [x + sin + cos, y + sin - cos],
                [x + cos, y + sin],
            ]).render({ stroke: 'black' });
        }
    }
}