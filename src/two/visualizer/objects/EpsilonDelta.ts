import { Coord } from '../../../types';
import BaseObject from '../BaseObject';
import Scene from '../Scene';
import { Label } from '../types';
import { Axes } from './Axes';
import { Graph } from './Graph';
import { Line } from './Line';
import { Polygon } from './Polygon';

const MAX_DELTA = 1.5;
const DELTA_STEP = 0.01;
const FN_STEP = 0.1;
const X_LEFT_PAD = 0.5;
const Y_PAD = 0.0000001;

class BaseEpsilonDelta<T = unknown> extends BaseObject {
    graph: Graph;
    axes!: Axes;
    lines!: Line[];
    rect!: Polygon;
    constructor(scene: Scene, fn: Fn, private config: Config & T) {
        super(scene);
        this.graph = new Graph(scene, fn, config.range);
    }

    createAxes(xLabels: Label[], yLabels: Label[]) {
        this.axes = new Axes(
            this.scene,
            [this.config.range[0] - X_LEFT_PAD, this.config.range[1]],
            [this.graph.absMin - Y_PAD, this.graph.absMax + Y_PAD],
            xLabels, yLabels,
        );
    }

    render() {
        this.axes.render();
        this.graph.render();
        this.rect.render({ fill: 'red', opacity: 0.3 });
        for (const l of this.lines) l.render({ dotted: true });
    }

    getDelta(a: number, fn: (x: number) => boolean) {
        let delta = MAX_DELTA;
        for (; delta > 0; delta -= DELTA_STEP) {
            let bounded = true;
            for (let x = a - delta; x < a + delta; x += FN_STEP) {
                if (fn(x)) bounded = false;
            }
            if (bounded) break;
        }
        return delta;
    }
}

export class EpsilonDelta extends BaseEpsilonDelta<{ x: number; }> {
    constructor(scene: Scene, fn: Fn, config: Config & { x: number; }) {
        super(scene, fn, config);
        const l0 = fn(config.x);
        const l1 = l0 + config.epsilon;
        const l2 = l0 - config.epsilon;
        const delta = this.getDelta(config.x, x => Math.abs(fn(x) - l0) >= config.epsilon);
        const x1 = config.x - delta;
        const x2 = config.x + delta;
        const minY = Math.min(l2, this.graph.absMin);
        const maxY = Math.max(l1, this.graph.absMax);
        this.rect = new Polygon(scene, [
            [x1, l2],
            [x2, l2],
            [x2, l1],
            [x1, l1],
        ]);
        this.lines = [
            new Line(scene, [0, l0], [config.x, l0]),
            new Line(scene, [config.x, 0], [config.x, l0]),
            new Line(scene, [config.range[0], l1], [config.range[1], l1]),
            new Line(scene, [config.range[0], l2], [config.range[1], l2]),
            new Line(scene, [config.x - delta, minY], [config.x - delta, maxY]),
            new Line(scene, [config.x + delta, minY], [config.x + delta, maxY]),
        ];
        this.createAxes([[config.x, 'a'], [x1, 'a-\\delta'], [x2, 'a+\\delta']], [[l0, 'L'], [l1, 'L+\\varepsilon'], [l2, 'L-\\varepsilon']]);
    }
}

export class DivEpsilonDelta extends BaseEpsilonDelta<{ x: number; }> {
    constructor(scene: Scene, fn: Fn, config: Config & { x: number; }) {
        super(scene, fn, config);
        const delta = this.getDelta(config.x, x => fn(x) <= config.epsilon);
        const x1 = config.x - delta;
        const x2 = config.x + delta;
        this.rect = new Polygon(scene, [
            [x1, this.graph.absMax],
            [x2, this.graph.absMax],
            [x2, config.epsilon],
            [x1, config.epsilon],
        ]);
        this.lines = [
            new Line(scene, [config.x, 0], [config.x, this.graph.absMax]),
            new Line(scene, [0, config.epsilon], [config.range[1], config.epsilon]),
            new Line(scene, [x1, 0], [x1, this.graph.absMax]),
            new Line(scene, [x2, 0], [x2, this.graph.absMax]),
        ];
        this.createAxes([[config.x, 'a'], [x1, 'a-\\delta'], [x2, 'a+\\delta']], [[config.epsilon, '\\varepsilon']]);
    }
}

export class InfEpsilonDelta extends BaseEpsilonDelta {
    constructor(scene: Scene, fn: Fn, config: Config) {
        super(scene, fn, config);
        const l0 = fn(10 ** 15);
        const l1 = l0 + config.epsilon;
        const l2 = l0 - config.epsilon;
        let delta = config.range[0];
        for (; delta < config.range[1]; delta += DELTA_STEP) {
            let bounded = true;
            for (let x = delta; x < config.range[1]; x += DELTA_STEP) {
                if (Math.abs(fn(x) - l0) >= config.epsilon) bounded = false;
            }
            if (bounded) break;
        }
        this.rect = new Polygon(scene, [
            [delta, l1],
            [config.range[1], l1],
            [config.range[1], l2],
            [delta, l2],
        ]);
        this.lines = [
            new Line(scene, [delta, 0], [delta, this.graph.absMax]),
            new Line(scene, [0, l0], [config.range[1], l0]),
            new Line(scene, [0, l1], [config.range[1], l1]),
            new Line(scene, [0, l2], [config.range[1], l2]),
        ];
        this.createAxes([[delta, '\\delta']], [[l0, 'L'], [l1, 'L+\\varepsilon'], [l2, 'L-\\varepsilon']]);
    }
}

type Fn = (x: number) => number;
type Config = { range: Coord; epsilon: number; };