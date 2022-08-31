import { Coord } from '../../../types';
import BaseObject from '../BaseObject';
import Scene from '../Scene';
import { Line } from './Line';

export class Circle extends BaseObject {
    constructor(scene: Scene, private radius: number, private center: Coord) {
        super(scene);
        this.points = [-1, 1].map(c => <Coord>center.map(n => n + radius * c));
    }

    getRadius(angle: number) {
        return new Line(this.scene, this.center, [
            this.center[0] + this.radius * Math.cos(angle),
            this.center[1] + this.radius * Math.sin(angle),
        ]);
    }

    render() {
        const { ctx } = this.scene;
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.arc(...this.center, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}