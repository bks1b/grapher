import { Coord } from '../../../types';
import BaseObject from '../BaseObject';
import Scene from '../Scene';
import { Angle } from './Angle';
import { Line } from './Line';
import { Point } from './Point';
import { Polygon } from './Polygon';

const RIGHT_SIZE = 0.2;

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

    renderRightAngle(i: number) {
        const pt = this.points[i];
        const pt2 = this.points[(i + 1) % 3];
        this._renderRightAngle(pt, Math.atan2(pt2[1] - pt[1], pt2[0] - pt[0]));
    }

    renderAltitudes(data: [(string | false)?, boolean?][]) {
        for (let i = 0; i < data.length; i++) if (typeof data[i][0] === 'string') {
            this.altitudes[i].render({ label: <string>data[i][0] });
            if (data[i][1]) this._renderRightAngle(this.altitudes[i].end, Math.atan2(...<Coord>[1, 0].map(j => this.sides[i].end[j] - this.sides[i].start[j])));
        }
    }

    private _renderRightAngle(coords: Coord, angle: number) {
        const sin = RIGHT_SIZE * Math.sin(angle);
        const cos = RIGHT_SIZE * Math.cos(angle);
        new Polygon(this.scene, [
            coords,
            [coords[0] + sin, coords[1] - cos],
            [coords[0] + sin + cos, coords[1] + sin - cos],
            [coords[0] + cos, coords[1] + sin],
        ]).render({ stroke: 'black' });
    } 
}