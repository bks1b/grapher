import katex from 'katex';
import WebFont from 'webfontloader';

const fontsLoaded = new Promise<void>(r => WebFont.load({
    custom: {
        urls: ['https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css'],
        families: ['KaTeX_Main', 'KaTeX_Math'],
    },
    active: r,
}));

export const renderLatex = async (str: string, el: HTMLElement, margin: number) => {
    await fontsLoaded;
    katex.render(str, el, { displayMode: true, strict: false });
    const child = <HTMLElement>el.children[0];
    child.style.margin = margin + 'px';
    const rect = el.getBoundingClientRect();
    return <const>[rect.width, rect.height, child];
};

export class LatexContainer {
    private element: HTMLElement;
    constructor(cont: HTMLElement) {
        const el = document.createElement('div');
        this.element = el;
        el.style.position = 'absolute';
        el.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        el.style.userSelect = 'none';
        cont.appendChild(el);
    }

    async render(text: string, x: number, y: number) {
        this.element.style.display = '';
        const [w, h] = await renderLatex(text, this.element, 4);
        this.element.style.left = x - w / 2 * window.devicePixelRatio + 'px';
        this.element.style.top = y + h - h / 2 * window.devicePixelRatio + 'px';
        this.element.style.scale = 1 / window.devicePixelRatio + '';
    }

    hide() {
        this.element.style.display = 'none';
    }
}