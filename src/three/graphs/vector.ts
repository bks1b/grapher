import { BufferGeometry, Group, Intersection, Points, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { EPSILON, format, renderCoords, renderVector } from '../../util';
import BaseGraph from '../BaseGraph';
import { Coord3 } from '../types';
import { getNormColor, normalizedVector } from '../util';

abstract class VectorGraph<K extends 'vectorField' | 'flowCurves'> extends BaseGraph<K> {
    points!: number[][][];
    group!: Group;

    graph() {
        this.points = [];
        this.group = new Group();
        for (let x = this.config.xRange[0]; x <= this.config.xRange[1]; x += this.config.step) {
            for (let y = this.config.yRange[0]; y <= this.config.yRange[1]; y += this.config.step) {
                for (let z = this.config.zRange[0]; z <= this.config.zRange[1]; z += this.config.step) this.iter(x, y, z);
            }   
        }
        this.grapher.scene.add(this.group);
        this.raycast = new Points(new BufferGeometry().setFromPoints(this.points.map(x => new Vector3(x[0][0], x[0][2], x[0][1]))));
    }

    getPoint(inter: Intersection) {
        const [[x, y, z], [vx, vy, vz]] = this.points[inter.index!];
        const xStep = this.fn(x + EPSILON, y, z);
        const yStep = this.fn(x, y + EPSILON, z);
        const zStep = this.fn(x, y, z + EPSILON);
        return {
            point: <Coord3>[x, -y, z],
            text: `${renderCoords(x, -y, z)}\\mapsto ${renderVector(vx, -vy, vz)}\\\\\\text{div}=${format((xStep[0] - vx + yStep[1] - vy + zStep[2] - vz) / EPSILON)}\\quad\\text{curl}=${renderVector((yStep[2] - vz - zStep[1] + vy) / EPSILON, (zStep[0] - vx - xStep[2] + vz) / EPSILON, (xStep[1] - vy - yStep[0] + vx) / EPSILON)}`,
        };
    }

    abstract iter(...args: number[]): void;
}

export class VectorField extends VectorGraph<'vectorField'> {
    static key = 'vectorField';

    iter(x: number, y: number, z: number) {
        const vec = this.fn(x, y, z);
        this.group.add(normalizedVector([vec[0], vec[2], -vec[1]], [x, z, -y], this.config));
        this.points.push([[x, y, z], vec]);
    }
}

export class FlowCurves extends VectorGraph<'flowCurves'> {
    static key = 'flowCurves';

    iter(x: number, y: number, z: number) {
        let arclength = 0;
        let norm = Infinity;
        let lastPoint = [x, y, z];
        let lastVec = [0, 0, 0];
        while (arclength < this.config.arclength && norm >= this.config.minNorm) {
            lastVec = this.fn(lastPoint[0], lastPoint[1], lastPoint[2]);
            this.points.push([lastPoint, lastVec].map(p => [p[0], -p[1], p[2]]));
            const pt = lastVec.map((x, i) => lastPoint[i] + this.config.accuracy * x);
            arclength += norm = this.config.accuracy * Math.hypot(...lastVec);
            this.group.add(new Line2(
                new LineGeometry().setPositions([lastPoint, pt].flatMap(p => [p[0], p[2], -p[1]])),
                new LineMaterial({ color: getNormColor(norm / this.config.accuracy / this.config.sigmoidScale), linewidth: this.config.lineWidth }),
            ));
            lastPoint = pt;
        }
        const [vec, origin] = [lastVec, lastPoint].map(p => [p[0], p[2], -p[1]]);
        this.group.add(normalizedVector(vec, origin, { ...this.config, length: norm }));
    }
}