import { Coord } from '../../../types';
import { getCoordOrder } from '../../util';
import BaseObject from '../BaseObject';
import Scene from '../Scene';
import { Label } from '../types';
import { Line } from './Line';

const PADDING = 0.5;
const LABEL_SIZE = 0.25;
const LABEL_W = 2;

export class Axes extends BaseObject {
    private lines: Line[];
    private labels: (readonly [Line, Label, number])[];
    constructor(scene: Scene, xRange: Coord, yRange: Coord, xLabels?: Label[], yLabels?: Label[]) {
        super(scene);
        this.lines = [
            new Line(this.scene, [xRange[0] - PADDING, 0], [xRange[1] + PADDING, 0]),
            new Line(this.scene, [0, yRange[0] - PADDING], [0, yRange[1] + PADDING]),
        ];
        this.labels = [xLabels, yLabels].flatMap((a, i) => a?.map(x => <const>[new Line(this.scene, getCoordOrder([x[0], -LABEL_SIZE / 2], i), getCoordOrder([x[0], LABEL_SIZE / 2], i)), x, i]) || []);
    }

    render() {
        for (const l of this.lines) l.render();
        for (const m of this.labels) {
            m[0].render({ lineWidth: LABEL_W });
            this.scene.createLabel(m[1][1], (w, h) => getCoordOrder([m[1][0] - [w, h][m[2]] / 2, -LABEL_SIZE / 2 - [h, w][m[2]]], m[2]));
        }
    }
}