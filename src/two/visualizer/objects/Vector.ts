import { Coord } from '../../../types';
import { renderVector } from '../../../util';
import { vector } from '../../util';
import BaseObject from '../BaseObject';
import { SCALE } from '../constants';
import Scene from '../Scene';
import { LabelConfig } from '../types';

const BASE = 0.08;
const HEIGHT = 0.15;
const RAD_PAD = 0.1;

export class Vector extends BaseObject {
    constructor(scene: Scene, private vec: Coord, private origin: Coord = [0, 0]) {
        super(scene);
        this.points = [origin, [origin[0] + vec[0], origin[1] + vec[1]]];
    }

    render(config: LabelConfig & { color?: string; } = {}) {
        vector(this.scene.ctx, this.vec, this.origin, { color: config.color || 'black', lineWidth: 1 / SCALE, base: BASE, height: HEIGHT });
        if (config.label || config.x || config.y) this.scene.createLabel(
            typeof config.label === 'string' ? config.label : renderVector(config.x || this.vec[0], config.y || this.vec[1]),
            (w, h) => {
                const a = Math.atan2(this.vec[1], this.vec[0]);
                const r = Math.min(w, h) * Math.SQRT1_2 + RAD_PAD;
                return [this.origin[0] + this.vec[0] + r * Math.cos(a) - w / 2, this.origin[1] + this.vec[1] + r * Math.sin(a) - h / 2];
            },
        );
    }
}