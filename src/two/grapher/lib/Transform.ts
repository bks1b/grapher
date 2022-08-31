import { Coord } from '../../../types';

export default class Transform {
    scalar!: number;
    xOffset!: number;
    yOffset!: number;
    constructor(public ctx: CanvasRenderingContext2D, private event: () => any) {
        this.reset();
    }

    get array() {
        return <const>[this.scalar, 0, 0, this.scalar, this.xOffset, this.yOffset];
    }

    get object() {
        return {
            a: this.scalar,
            b: 0,
            c: 0,
            d: this.scalar,
            e: this.xOffset,
            f: this.yOffset,
        };
    }

    scale(n: number) {
        this.ctx.scale(n, n);
        this.scalar *= n;
        this.event?.();
    }

    translate(x: number, y: number) {
        this.ctx.translate(x, y);
        this.xOffset += x * this.scalar;
        this.yOffset += y * this.scalar;
        this.event?.();
    }

    reset() {
        this.scalar = 1;
        this.xOffset = 0;
        this.yOffset = 0;
    }

    ignore(fn: () => any) {
        const obj = this.object;
        this.ctx.resetTransform();
        fn();
        this.ctx.setTransform(obj);
    }

    overrideInitial(fn: () => any) {
        const arr = this.array;
        this.reset();
        this.ctx.resetTransform();
        fn();
        this.ctx.transform(...arr);
        this.translate(arr[4], arr[5]);
        this.scale(arr[0]);
    }

    toScreen(x: number, y: number) {
        return <Coord>[this.xOffset + x * this.scalar, this.yOffset + y * this.scalar];
    }

    toCanvas(x: number, y: number) {
        return <Coord>[(x - this.xOffset) / this.scalar, (y - this.yOffset) / this.scalar];
    }
}