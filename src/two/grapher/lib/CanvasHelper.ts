import { Coord } from '../../../types';
import Transform from './Transform';

export default abstract class {
    ctx: CanvasRenderingContext2D;
    transform: Transform;
    constructor(public element: HTMLCanvasElement, private background = 'white') {
        this.ctx = element.getContext('2d')!;
        this.transform = new Transform(this.ctx, () => this.onTransform?.());
    }

    get start() {
        return this.transform.toCanvas(0, 0);
    }

    get end() {
        return this.transform.toCanvas(this.element.width, this.element.height);
    }
    
    preRender() {
        if (typeof this.background === 'string') this.transform.ignore(() => {
            const { ctx } = this;
            ctx.beginPath();
            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, this.element.width, this.element.height);
        });
    }

    forceRender() {
        this.preRender();
        this.render();
    }

    getMouseCoords(e: MouseEvent) {
        return <Coord>[e.offsetX, e.offsetY];
    }

    abstract onTransform?(): any;
    abstract render(): any;
}