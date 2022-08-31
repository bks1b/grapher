import BaseGraph from '../BaseGraph';
import { roundCoords } from '../util';
import { isUndef, format, renderCoords } from '../../../util';
import { Coord } from '../../../types';
import { getCoordOrder } from '../../util';

abstract class LineGraph<K extends 'cartesian' | 'parametric' | 'polar', V = number[]> extends BaseGraph<K, V> {
    startSegment(coords: Coord) {
        const { ctx } = this;
        this.lastCoords = coords;
        ctx.beginPath();
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = this.config.lineWidth / this.scale;
        ctx.moveTo(...coords);
    }

    graphCoords(coords: Coord, index: number, { invertSlope, id, text }: { invertSlope?: boolean; id?: number; text?: string; } = {}) {
        const points = this.grapher.config.points;
        if (coords.some(x => isUndef(x))) {
            this.lastCoords = undefined;
            this.ctx.stroke();
            return;
        }
        if (!this.lastCoords) return this.startSegment(coords);
        const slope = (coords[1] - this.lastCoords[1]) / (coords[0] - this.lastCoords[0]);
        const curvature = this.points.length ? (slope - this.points.slice(-1)[0].slope!) / (coords[0] - this.lastCoords[0]) : 0;
        const pt = {
            x: coords[0],
            y: coords[1],
            text: `${id ? `${format(id)} \\mapsto ` : ''}${renderCoords(coords[0], -coords[1])}\\\\\\frac{dy}{dx}=${-format(slope)}\\quad\\frac{d^2y}{dx^2}=${-format(curvature)}${text ? '\\\\' + text : ''}`,
            slope,
            id,
        };
        this.points.push(pt);
        if (points.turningPoints.show && Math.abs(slope) <= points.turningPoints.maxSlope && Math.abs(curvature) >= points.turningPoints.minCurvature) {
            const k = `${roundCoords(coords, points.turningPoints.round)},${index}`;
            this.grapher.otherPoints[k] = [...this.grapher.otherPoints[k] || [], [pt, Math.abs(slope)]];
        }
        const minCoord = Math.min(...coords.map(x => Math.abs(x)));
        if (points.zeroes.show && minCoord <= points.zeroes.maxVal && Math.abs(invertSlope ? 1 / slope : slope) >= points.zeroes.minSlope) {
            const k = `${roundCoords(coords, points.zeroes.round)},${index}`;
            this.grapher.otherPoints[k] = [...this.grapher.otherPoints[k] || [], [pt, minCoord]];
        }
        const interKey = roundCoords(coords, points.intersections.round);
        this.grapher.coordMap[interKey] = [...this.grapher.coordMap[interKey] || [], [pt, index]];
        if (Math.abs(slope) < this.config.maxSlope) {
            this.ctx.lineTo(...<Coord>coords);
            this.lastCoords = coords;
        } else {
            this.ctx.stroke();
            this.startSegment(coords);
        }
    }
}

export class Cartesian extends LineGraph<'cartesian', number> {
    static key = 'cartesian';

    graph(index: number) {
        const { ctx } = this;
        const [xScale, yScale] = getCoordOrder([1, -1], this.config.inverse);
        const idx = +!!this.config.inverse;
        const step = this.config.step / this.scale;
        for (let x = this.grapher.start[idx]; x <= this.grapher.end[idx] + step; x += step) {
            this.graphCoords(getCoordOrder([x, this.fn(x * xScale) * yScale], this.config.inverse), index, { invertSlope: this.config.inverse });
        }
        ctx.stroke();
    }
}

export class Parametric extends LineGraph<'parametric'> {
    static key = 'parametric';

    graph(index: number) {
        for (let t = this.config.range[0]; t <= this.config.range[1] + this.config.step; t += this.config.step) {
            this.graphCoords(<Coord>this.fn(t).map((x, i) => x * (-1) ** i), index, { id: t });
        }
        this.ctx.stroke();
    }
}

export class Polar extends LineGraph<'polar', number> {
    static key = 'polar';

    graph(index: number) {
        let lastR: number;
        let lastDer: number;
        for (let t = this.config.range[0]; t <= this.config.range[1] + this.config.step; t += this.config.step) {
            const r = this.fn(t);
            const der = (r - lastR!) / this.config.step;
            this.graphCoords([r * Math.cos(t), r * -Math.sin(t)], index, {
                id: t,
                text: lastR! === undefined ? '' : `\\frac{dr}{d\\theta}=${format(der)}${lastDer! === undefined ? '' : `\\quad\\frac{d^2r}{d\\theta^2}=${format((der - lastDer) / this.config.step)}`}`,
            });
            if (lastR! !== undefined) lastDer = der;
            lastR = r;
        }
        this.ctx.stroke();
    }
}