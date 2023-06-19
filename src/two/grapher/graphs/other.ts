import { ComplexFunction, OptionalConfig } from '../../../types';
import { EPSILON, format, getComplexText, isUndef, positiveSigmoid, renderCoords, renderVector, sigmoid } from '../../../util';
import { vector } from '../../util';
import BaseGraph from '../BaseGraph';
import Grapher from '../lib/Grapher';
import { Fns } from '../types';
import { getColor } from '../util';
import math from '../../../math';

const RAD_TO_DEG = 180 / Math.PI;

export class Inequality extends BaseGraph<'inequality', boolean> {
    static key = 'inequality';

    graph() {
        const { ctx } = this;
        const step = this.config.step / this.scale;
        ctx.beginPath();
        ctx.fillStyle = this.config.color;
        ctx.globalAlpha = this.config.opacity;
        this.iterViewport((x, y) => {
            if (!this.fn(x, -y)) return;
            if ([-1, 1].some(d => !this.fn((x + step * d), -y))) this.points.push({ x, y, text: renderCoords(x, y) });
            ctx.fillRect(x, y, step, step);
        });
        ctx.globalAlpha = 1;
    }
}

export class Scalar extends BaseGraph<'scalar', number> {
    static key = 'scalar';

    graph() {
        const { ctx } = this;
        const step = this.config.step / this.scale;
        ctx.globalAlpha = this.config.opacity;
        this.iterViewport((x, y) => {
            const z = this.fn(x, -y);
            if (isUndef(z)) return;
            ctx.beginPath();
            ctx.fillStyle = getColor(sigmoid(z / this.config.sigmoidScale));
            ctx.fillRect(x, y, step, step);
            this.points.push({
                x,
                y,
                text: `${renderCoords(x, -y)}\\mapsto ${format(z)}\\\\\\text{grad}=${renderVector((this.fn(x + EPSILON, y) - z) / EPSILON, (this.fn(x, -y + EPSILON) - z) / EPSILON)}`,
            });
        });
        ctx.globalAlpha = 1;
    }
}

export class ComplexScalar extends BaseGraph<'complexScalar', number[], [number[]]> {
    static key = 'complexScalar';

    graph() {
        const { ctx } = this;
        const step = this.config.step / this.scale;
        ctx.globalAlpha = this.config.opacity;
        this.iterViewport((x, y) => {
            const w = this.fn([x, -y]);
            if (w.some(x => isUndef(x))) return;
            const mod = math.mod(w);
            const arg = math.arg(w);
            ctx.beginPath();
            ctx.fillStyle = `hsl(${arg * RAD_TO_DEG + 120} 100% ${this.config.maxLum - (this.config.maxLum - this.config.minLum) / this.config.mod * (Math.log(mod) / this.config.logScale % this.config.mod)}%)`;
            ctx.fillRect(x, y, step, step);
            this.points.push({
                x,
                y,
                text: getComplexText(this.fn, w, x, y, mod, arg),
            });
        });
        ctx.globalAlpha = 1;
    }
}

export class VectorField extends BaseGraph<'vectorField'> {
    static key = 'vectorField';

    graph() {
        const { ctx } = this;
        this.iterViewport((x, y) => {
            const vec = this.fn(x, -y);
            if (vec.some(x => isUndef(x))) return;
            const dx = this.fn(x + EPSILON, -y);
            const dy = this.fn(x, -y - EPSILON);
            this.points.push({
                x,
                y,
                text: `${renderCoords(x, -y)}\\mapsto${renderVector(vec[0], vec[1])}\\\\\\text{div}=${format((dx[0] - vec[0] - dy[1] + vec[1]) / EPSILON)}\\quad\\text{curl}=${format((dx[1] - vec[1] + dy[0] - vec[0]) / EPSILON)}`,
            });
            vec[1] *= -1;
            const norm = Math.hypot(...vec);
            vector(ctx, vec.map(x => x / norm * this.config.length / this.scale), [x, y], {
                color: getColor(positiveSigmoid(norm / this.config.sigmoidScale)),
                lineWidth: this.config.lineWidth / this.scale,
                base: this.config.base / this.scale,
                height: this.config.height / this.scale,
            });
        });
    }
}

export class PolyaField extends VectorField {
    constructor(grapher: Grapher, fn: ComplexFunction, config: OptionalConfig<Fns['vectorField']> = {}) {
        super(grapher, (r, i) => math.conjugate(fn([r, i])), config);
    }
}