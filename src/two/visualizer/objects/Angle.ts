import { Coord } from '../../../types';
import { format } from '../../../util';
import BaseObject from '../BaseObject';
import Scene from '../Scene';

const LABEL_RATIO = 0.5;

export class Angle extends BaseObject {
    constructor(scene: Scene, private center: Coord, private pt1: Coord, private pt2: Coord) {
        super(scene);
    }

    render(label: string | boolean = false, radius = 1, sort = false) {
        let [a1, a2] = [this.pt1, this.pt2].map(c => Math.atan2(c[1] - this.center[1], c[0] - this.center[0]));
        if (sort) [a1, a2] = [Math.min(a1, a2), Math.max(a1, a2)];
        const a = (a1 + a2 - (a2 < 0 && sort ? Math.PI * 2 : 0)) / 2;
        const da = (a2 - a1 + Math.PI * 2) % (Math.PI * 2);
        const { ctx } = this.scene;
        ctx.beginPath();
        ctx.arc(...this.center, radius, a1, a2);
        ctx.stroke();
        if (label) this.scene.createLabel(typeof label === 'string' ? label : format(da / Math.PI * 180) + '^{\\circ}', (w, h) => {
            const rad = Math.sign(a2 - a1) * (radius * LABEL_RATIO + Math.sqrt(2) * Math.min(w, h) / 2);
            return [this.center[0] + Math.cos(a) * rad - w / 2, this.center[1] + Math.sin(a) * rad - h / 2];
        });
    }
}