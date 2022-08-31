import GraphConfig from '../../GraphConfig';
import { Coord } from '../../types';
import Grapher from './lib/Grapher';
import { Fns, Point } from './types';

export default abstract class<K extends keyof Fns, V = number[], I extends any[] = number[]> extends GraphConfig<Grapher, K, V, I> {
    points!: Point[];
    lastCoords?: Coord;

    get ctx() {
        return this.grapher.ctx;
    }

    get scale() {
        return this.grapher.transform.scalar;
    }

    iterViewport(fn: (x: number, y: number) => any) {
        const step = this.config.step / this.scale;
        for (let x = this.grapher.start[0] - step - this.grapher.start[0] % step; x <= this.grapher.end[0] + step; x += step) {
            for (let y = this.grapher.start[1] - step - this.grapher.start[1] % step; y <= this.grapher.end[1] + step; y += step) fn(x, y);
        }
    }

    abstract graph(i: number): any;
}