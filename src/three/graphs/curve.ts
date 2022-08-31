import { Vector3, Curve as BaseCurve, Points, Mesh, TubeGeometry, BufferGeometry, Intersection, MeshBasicMaterial } from 'three';
import { Coord, OptionalConfig } from '../../types';
import { EPSILON, format, isUndef, renderCoords } from '../../util';
import BaseGraph from '../BaseGraph';
import Grapher from '../lib/Grapher';
import { Fns } from '../types';
import { normalizedVector } from '../util';

class ThreeCurve extends BaseCurve<Vector3> {
    public points: Vector3[] = [];
    public params: number[] = [];
    constructor(private fn: (...args: number[]) => number[], private range: Coord) {
        super();
    }

    getPoint(n: number) {
        const t = n * (this.range[0] - this.range[1]) + this.range[1];
        const val = this.fn(t);
        this.params.push(t);
        const pt = new Vector3(...[val[0], val[2], -val[1]].map(x => isUndef(x) ? 0 : x));
        this.points.push(pt);
        return pt;
    }
}

export class Curve extends BaseGraph<'curve'> {
    static key = 'curve';

    curve!: ThreeCurve;

    init() {
        this.curve = new ThreeCurve(this.fn, this.config.range);
    }

    graph() {
        this.grapher.scene.add(new Mesh(new TubeGeometry(this.curve, this.config.segments, this.config.radius, this.config.radiusSegments), new MeshBasicMaterial({ color: this.config.color })));
        this.raycast = new Points(new BufferGeometry().setFromPoints(this.curve.points));
    }

    getPoint(inter: Intersection) {
        const t = this.curve.params[inter.index!];
        const val = this.fn(t);
        if (val.some(x => isUndef(x))) return;
        const step = this.fn(t + EPSILON);
        const derivatives = step.map((x, i) => (x - val[i]) / EPSILON);
        return {
            point: val,
            text: this.config.cartesian
                ? `${renderCoords(val[0], val[1])}\\\\\\frac{dy}{dx}=${format(derivatives[1])}`
                : `${format(t)}\\mapsto ${renderCoords(val[0], val[1], ...this.config.hideZ ? [] : [val[2]])}\\\\${derivatives.slice(0, this.config.hideZ ? 2 : 3).map((d, i) => `\\frac{d${'xyz'[i]}}{dt}=${format(d)}`).join('\\quad')}${this.config.hideZ ? `\\quad\\frac{dy}{dx}=${format((step[1] - val[1]) / (step[0] - val[0]))}` : ''}`,
            obj: normalizedVector([derivatives[0], derivatives[2], -derivatives[1]], [val[0], val[2], -val[1]], this.config.tangent),
        };
    }
}

export class Curve2D extends Curve {
    constructor(grapher: Grapher, fn: (t: number) => Coord, config: OptionalConfig<Fns['curve']> = {}) {
        super(grapher, t => [...fn(t), 0], { ...config, hideZ: true });
    }
}

export class Cartesian extends Curve {
    constructor(grapher: Grapher, fn: (x: number) => number, config: OptionalConfig<Fns['curve']> = {}) {
        super(grapher, x => [x, fn(x), 0], { ...config, cartesian: true });
    }
}