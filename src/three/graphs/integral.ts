import { BufferGeometry, DoubleSide, Intersection, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { format, renderCoords } from '../../util';
import BaseGraph from '../BaseGraph';

export class LineIntegral extends BaseGraph<'lineIntegral', number> {
    static key = 'lineIntegral';

    params!: number[];

    graph() {
        this.params = [];
        const points: Vector3[] = [];
        for (let t = this.config.range[0]; t <= this.config.range[1]; t += this.config.step) {
            const val = this.config.curve(t);
            points.push(...[0, this.fn(...val)].map(z => new Vector3(val[0], z, -val[1])));
            this.params.push(t, t);
        }
        this.grapher.scene.add(this.raycast = new Mesh(
            new BufferGeometry().setFromPoints(points.slice(2).flatMap((x, i) => [x, ...points.slice(i, i + 2)])),
            new MeshBasicMaterial({ color: this.config.color, side: DoubleSide }),
        ));
    }

    getPoint(inter: Intersection) {
        return {
            text: `${format(this.params[inter.faceIndex!])}\\mapsto${renderCoords(inter.point.x, -inter.point.y)}\\mapsto ${format(this.fn(inter.point.x, inter.point.y))}`,
        };
    }
}

export class DoubleIntegral extends BaseGraph<'doubleIntegral', number> {
    static key = 'doubleIntegral';

    graph() {
        const points = [];
        for (let c0 = this.config.interval[0]; c0 <= this.config.interval[1]; c0 += this.config.intervalStep) {
            const [a, b] = this.config.curves(c0);
            for (let c1 = a; c1 <= b; c1 += this.config.curveStep) {
                const [[x, y], [xStep, yStep]] = [[c0, c1], [this.config.intervalStep, this.config.curveStep]].map(a => this.config.intervalAxis === 'x' ? a : a.reverse());
                const v1 = new Vector3(x, this.fn(x, y + yStep), -y - yStep);
                const v2 = new Vector3(x + xStep, this.fn(x + xStep, y), -y);
                points.push(new Vector3(x, this.fn(x, y), -y), v1, v2, v2, new Vector3(x + xStep, this.fn(x + xStep, y + yStep), -y - yStep), v1);
            }
        }
        this.grapher.scene.add(this.raycast = new Mesh(
            new BufferGeometry().setFromPoints(points),
            new MeshBasicMaterial({ color: this.config.color, side: DoubleSide }),
        ));
    }

    getPoint(inter: Intersection) {
        return { text: renderCoords(inter.point.x, -inter.point.z, inter.point.y) };
    }
}