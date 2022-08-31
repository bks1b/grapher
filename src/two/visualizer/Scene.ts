import { renderLatex } from '../../katex';
import { Coord } from '../../types';
import BaseObject from './BaseObject';
import { SCALE } from './constants';

export default class {
    private initialized = false;
    ctx: CanvasRenderingContext2D;
    element: HTMLCanvasElement;
    objects: BaseObject[] = [];
    elements: HTMLElement[] = [];
    sliderContainer?: HTMLDivElement;
    minX?: number;
    minY?: number;
    maxX?: number;
    maxY?: number;
    constructor(public container: HTMLElement, private fixedSize = true) {
        this.element = document.createElement('canvas');
        container.appendChild(this.element);
        this.element.style.transform = 'scaleY(-1)';
        container.style.position = 'relative';
        this.ctx = this.element.getContext('2d')!;
        this.element.addEventListener('mousemove', e => {
            this.mouseMove?.((e.offsetX + this.minX!) / SCALE, (e.offsetY + this.minY!) / SCALE);
        });
    }

    init() {
        for (const el of this.elements) el.parentElement?.removeChild(el);
        this.elements = [];
        this.objects = [];
    }

    preRender() {
        const { ctx } = this;
        if (!this.fixedSize || !this.initialized) {
            this.initialized = true;
            const points = this.objects.flatMap(x => x.points);
            const xCoords = points.map(x => x[0] * SCALE);
            const yCoords = points.map(x => x[1] * SCALE);
            [this.minX, this.minY, this.maxX, this.maxY] = [Math.min(...xCoords), Math.min(...yCoords), Math.max(...xCoords), Math.max(...yCoords)];
            this.element.width = this.maxX - this.minX;
            this.element.height = this.maxY - this.minY;
            this.container.style.width = this.element.width + 'px';
            if (this.sliderContainer) this.sliderContainer.style.width = this.element.width + 'px';
        }
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, this.element.width, this.element.height);
        ctx.translate(-this.minX!, -this.minY!);
        ctx.scale(SCALE, SCALE);
        ctx.lineWidth = 1 / SCALE;
    }

    async createSliders(fn: (...args: number[]) => any, sliders: {
        label: string;
        range: [number, number];
        step: number;
        val: number;
    }[]) {
        const update = () => fn(...inps.map(x => +x.value));
        this.sliderContainer = document.createElement('div');
        const inps: HTMLInputElement[] = [];
        for (const s of sliders) {
            const div = document.createElement('div');
            const label = document.createElement('div');
            const inp = document.createElement('input');
            const [,, child] = await renderLatex(s.label, label, 0);
            div.style.display = 'flex';
            child.style.textAlign = (<HTMLElement>child.children[0]).style.textAlign = 'left';
            inp.type = 'range';
            inp.min = s.range[0] + '';
            inp.max = s.range[1] + '';
            inp.step = s.step + '';
            inp.value = inp.title = s.val + '';
            inp.oninput = () => {
                inp.title = inp.value;
                this.init();
                update();
            };
            inps.push(inp);
            div.appendChild(label);
            div.appendChild(inp);
            this.sliderContainer.appendChild(div);
        }
        this.sliderContainer.style.display = 'flex';
        this.sliderContainer.style.alignItems = 'center';
        this.sliderContainer.style.flexDirection = 'column';
        this.container.appendChild(this.sliderContainer);
        update();
    }

    async createLabel(label: string | undefined, fn: (w: number, h: number) => Coord) {
        if (!label) return;
        const el = document.createElement('div');
        el.style.position = 'absolute';
        this.elements.push(el);
        this.container.appendChild(el);
        const [w, h] = await renderLatex(label, el, 0);
        const [x, y] = fn(w / SCALE, h / SCALE);
        el.style.position = 'absolute';
        el.style.left = x * SCALE - this.minX! + 'px';
        el.style.top = this.maxY! - y * SCALE - h + 'px';
    }

    mouseMove?(x: number, y: number): any;
}