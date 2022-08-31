import { OptionalConfig } from '../../../types';
import { assignConfig } from '../../../util';
import { getCoordOrder } from '../../util';
import { CartesianConfig, PlaneConfig } from '../types';
import Plane from './Plane';

export default abstract class extends Plane {
    config!: PlaneConfig & CartesianConfig;
    constructor(element: HTMLCanvasElement, config: OptionalConfig<CartesianConfig> = {}, planeConfig: OptionalConfig<PlaneConfig> = {}) {
        super(element, planeConfig);
        Object.assign(this.config, assignConfig<CartesianConfig>({
            polar: false,
            axes: {
                width: 2,
                color: 'black',
            },
            grid: {
                width: 1.5,
                color: '#bbb',
            },
            minorGrid: {
                width: 1,
                color: '#ddd',
                density: 5,
                angleStep: Math.PI / 6,
            },
            labels: {
                minSize: 140, 
                base: 10,
                reducers: [0.2, 0.5],
                margin: 15,
                padding: 2,
                background: {
                    color: 'white',
                    opacity: 1,
                },
                font: {
                    color: 'black',
                    size: 15,
                    family: 'Arial',
                },
            },
        }, config));
    }

    loop(gap: number, fn: (c: number, i: number) => any) {
        for (const i of [0, 1]) {
            for (let c = this.start[1 - i] - this.start[1 - i] % gap; c < this.end[1 - i]; c += gap) {
                if (Math.abs(c) < gap / 2) continue;
                fn(c, i);
            }
        }
    }

    renderGrid() {
        const { ctx, start, end, transform: { scalar: scale } } = this;
        const minRange = this.config.labels.minSize / scale;
        let gap = this.config.labels.base ** Math.ceil(Math.log(minRange) / Math.log(this.config.labels.base));
        gap *= this.config.labels.reducers.find(x => gap * x > minRange) || 1;
        const minorGap = gap / this.config.minorGrid.density;
        if (this.config.polar) {
            const maxRad = Math.max(...[start, end, [end[0], start[1]], [start[0], end[1]]].map(c => Math.hypot(...c)));
            for (let r = 0; r < maxRad; r += minorGap) {
                const key = (r / minorGap) % this.config.minorGrid.density ? 'minorGrid' : 'grid';
                ctx.beginPath();
                ctx.strokeStyle = this.config[key].color;
                ctx.lineWidth = this.config[key].width / scale;
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.stroke();
            }
            for (let t = 0; t < Math.PI * 2; t += this.config.minorGrid.angleStep) {
                ctx.beginPath();
                ctx.strokeStyle = this.config.minorGrid.color;
                ctx.lineWidth = this.config.minorGrid.width / scale;
                ctx.moveTo(0, 0);
                ctx.lineTo(maxRad * Math.cos(t), maxRad * Math.sin(t));
                ctx.stroke();
                ctx.beginPath();
            }
        } else this.loop(minorGap, (c, i) => {
            const key = (c / minorGap) % this.config.minorGrid.density ? 'minorGrid' : 'grid';
            ctx.beginPath();
            ctx.strokeStyle = this.config[key].color;
            ctx.lineWidth = this.config[key].width / scale;
            ctx.moveTo(...getCoordOrder([start[i], c], i));
            ctx.lineTo(...getCoordOrder([end[i], c], i));
            ctx.stroke();
        });
        const textH = this.config.labels.font.size / scale;
        const textMargin = this.config.labels.margin / scale;
        const textPad = this.config.labels.padding / scale;
        this.loop(gap, (c, i) => {
            const num = (-1) ** (1 - i) * +c.toFixed(2) + '';
            ctx.font = `${textH}px ${this.config.labels.font.family}`;
            const textW = ctx.measureText(num).width;
            const [textX, textY] = i
                ? [
                    c - textW / 2,
                    end[1] > textMargin * 2 + textH - 3 / scale
                        ? start[1] > 0
                            ? start[1] + textMargin
                            : textMargin
                        : end[1] - textH + 3 / scale - textMargin,
                ]
                : [
                    end[0] > 0
                        ? start[0] > -textMargin * 2 - textW
                            ? start[0] + textMargin
                            : -textMargin - textW
                        : end[0] - textMargin - textW,
                    c,
                ];
            ctx.beginPath();
            ctx.fillStyle = this.config.labels.background.color;
            ctx.globalAlpha = this.config.labels.background.opacity;
            ctx.fillRect(textX - textPad / 2, textY - (i ? 2 / scale : 2 / 3 * textH), textW + textPad, textH + textPad);
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.fillStyle = this.config.labels.font.color;
            ctx.textBaseline = i ? 'top' : 'middle';
            ctx.fillText(num, textX, textY);
        });
        for (const i of [0, 1]) {
            ctx.beginPath();
            ctx.strokeStyle = this.config.axes.color;
            ctx.lineWidth = this.config.axes.width / scale;
            ctx.moveTo(...getCoordOrder([start[i], 0], i));
            ctx.lineTo(...getCoordOrder([end[i], 0], i));
            ctx.stroke();
        }
    }
}