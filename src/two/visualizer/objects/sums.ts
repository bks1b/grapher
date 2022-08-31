import { Coord } from '../../../types';
import BaseObject from '../BaseObject';
import Scene from '../Scene';
import { GRAPH_STEP } from '../constants';
import { Axes } from './Axes';
import { Graph } from './Graph';
import { Polygon, Rect } from './Polygon';

const polygonConfig = { opacity: 0.5, stroke: 'black' };
const coloredConfig = { ...polygonConfig, fill: 'red' };

abstract class BaseSum<T = unknown> extends BaseObject {
    graph: Graph;
    axes: Axes;
    dx: number;
    constructor(scene: Scene, protected fn: (x: number) => number, protected config: Record<'fnRange' | 'sumRange', Coord> & { n: number; } & T) {
        super(scene);
        this.graph = new Graph(scene, fn, config.fnRange);
        this.axes = new Axes(this.scene, config.fnRange, [this.graph.absMin, this.graph.absMax], [[config.sumRange[0], 'a'], [config.sumRange[1], 'b']]);
        this.dx = (this.config.sumRange[1] - this.config.sumRange[0]) / this.config.n;
    }

    render() {
        this.axes.render();
        this.graph.render('black');
        for (let i = 0; i < this.config.n; i++) this.iter(this.config.sumRange[0] + this.dx * i);
    }

    abstract iter(x: number): any;
}

abstract class RectSum<T> extends BaseSum<T> {
    iter(x: number) {
        new Rect(this.scene, x, 0, this.dx, this.getY(x)).render(coloredConfig);
    }

    abstract getY(x: number): number;
}

export class RiemannSum extends RectSum<{ offset: number; }> {
    getY(x: number) {
        return this.fn(x + this.config.offset * this.dx);
    }
}

export class DarbouxSum extends RectSum<{ type?: 'min' | 'max'; }> {
    getY(x: number) {
        return this.graph[this.config.type === 'max' ? 'max' : 'min'](x, x + this.dx + GRAPH_STEP);
    }
}

export class TrapezoidalSum extends BaseSum<{ double?: boolean; }> {
    iter(x: number) {
        const y1 = this.fn(x);
        const y2 = this.fn(x + this.dx);
        new Polygon(this.scene, [
            [x, this.config.double ? -y1 : 0],
            [x + this.dx, this.config.double ? -y2 : 0],
            [x + this.dx, y2],
            [x, y1],
        ]).render(coloredConfig);
    }
}

export class ArclengthSum extends BaseSum {
    iter(x: number) {
        const y = this.fn(x);
        new Polygon(this.scene, [
            [x, y],
            [x + this.dx, y + this.graph.slope(x) * this.dx],
            [x + this.dx, y],
        ]).render(polygonConfig);
    }
}