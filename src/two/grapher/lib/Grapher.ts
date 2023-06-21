import { LatexContainer } from '../../../katex';
import { Coord, InputFunction, OptionalConfig } from '../../../types';
import { assignConfig } from '../../../util';
import { findSmallest } from '../../util';
import BaseGraph from '../BaseGraph';
import { CartesianConfig, GrapherConfig, PlaneConfig, Point } from '../types';
import CartesianPlane from './CartesianPlane';

const DEFAULT_CONFIG = {
    lineWidth: 3,
    color: '#2d70b3',
    maxSlope: 500,
    step: 0.01,
};

export default class Grapher extends CartesianPlane {
    rendered = false;
    latexContainer: LatexContainer;
    imageData?: ImageData;
    fns: BaseGraph<any>[];
    highlightedPoints!: Point[];
    coordMap!: Record<string, [Point, number][]>;
    otherPoints!: Record<string, [Point, number][]>;
    config!: PlaneConfig & CartesianConfig & GrapherConfig;
    constructor(
        private container: HTMLElement,
        fns: InputFunction<Grapher, BaseGraph<any, any, any>>,
        config: OptionalConfig<GrapherConfig> = {},
        cartesianConfig: OptionalConfig<CartesianConfig> = {},
        planeConfig: OptionalConfig<PlaneConfig> = {},
    ) {
        const c = document.createElement('canvas');
        container.appendChild(c);
        super(c, cartesianConfig, planeConfig);
        Object.assign(this.config, assignConfig<GrapherConfig>({
            points: {
                radius: 5,
                color: '#aaa',
                highlighted: {
                    slopeLength: 75,
                    radius: 3,
                    color: 'black',
                },
                zeroes: {
                    show: true,
                    round: 1.5,
                    maxVal: 0.015,
                    minSlope: 0.05,
                },
                turningPoints: {
                    show: false,
                    round: 1,
                    maxSlope: 0.03,
                    minCurvature: 0.2,
                },
                intersections: {
                    show: false,
                    round: 1,
                    maxDistance: 0.15,
                    minSlopeDiff: 0.4,
                },
            },
            fns: {
                cartesian: {
                    ...DEFAULT_CONFIG,
                    step: 0.8,
                    inverse: false,
                },
                parametric: DEFAULT_CONFIG,
                polar: DEFAULT_CONFIG,
                inequality: {
                    step: 7,
                    color: 'red',
                    opacity: 0.5,
                },
                scalar: {
                    step: 7,
                    sigmoidScale: 30,
                    opacity: 0.7,
                },
                vectorField: {
                    step: 25,
                    length: 21,
                    sigmoidScale: 20,
                    lineWidth: 2,
                    base: 6,
                    height: 10,
                },
                complexScalar: {
                    step: 7,
                    opacity: 0.8,
                    mod: 1,
                    minLum: 65,
                    maxLum: 40,
                    logScale: Math.LN2,
                },
            },
        }, config));
        container.style.position = 'relative';
        this.latexContainer = new LatexContainer(container);
        this.fns = fns.map(f => f(this));
        requestAnimationFrame(() => this.forceRender());
        this.resize();
    }

    resize(r = true) {
        const rect = this.container.getBoundingClientRect();
        this.element.width = rect.width * window.devicePixelRatio;
        this.element.height = rect.height * window.devicePixelRatio;
        this.element.style.width = rect.width + 'px';
        this.element.style.height = rect.height + 'px';
        if (r) this.resize(false);
        else this.forceRender();
    }

    render() {
        this.renderGrid();
        this.coordMap = {};
        this.otherPoints = {};
        const { ctx } = this;
        for (let i = 0; i < this.fns.length; i++) {
            this.fns[i].lastCoords = undefined;
            this.fns[i].points = [];
            this.fns[i].graph(i);
        }
        this.highlightedPoints = Object.values(this.otherPoints).map(x => findSmallest(x, p => p[1])![0][0]);
        if (this.config.points.intersections.show) for (const arr of Object.values(this.coordMap)) {
            let minDist = Infinity;
            let closestI;
            for (let i = 0; i < arr.length; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    if (arr[i][1] !== arr[j][1]) {
                        const dist = Math.hypot(arr[i][0].x - arr[j][0].x, arr[i][0].y - arr[j][0].y);
                        if (dist <= this.config.points.intersections.maxDistance && Math.abs(arr[i][0].slope! - arr[j][0].slope!) >= this.config.points.intersections.minSlopeDiff && dist < minDist) {
                            minDist = dist;
                            closestI = i;
                        }
                    }
                }
            }
            if (closestI !== undefined) this.highlightedPoints.push(arr[closestI][0]);
        }
        for (const pt of this.highlightedPoints) {
            ctx.beginPath();
            ctx.fillStyle = this.config.points.color;
            ctx.arc(pt.x, pt.y, this.config.points.radius / this.transform.scalar, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    redraw() {
        if (this.imageData) this.transform.ignore(() => this.ctx.putImageData(this.imageData!, 0, 0));
    }

    mouseMove(e: MouseEvent) {
        const { ctx, transform: { scalar: scale } } = this;
        const mouse = this.transform.toCanvas(...<Coord>this.getMouseCoords(e).map(x => x / window.devicePixelRatio));
        const mouseDist = (p: Point) => Math.hypot(p.x - mouse[0], p.y - mouse[1]);
        const closestH = findSmallest(this.highlightedPoints, mouseDist);
        const closestPt = findSmallest(this.fns.flatMap(f => f.points), mouseDist);
        const [closest] = closestH?.[1]! < 20 / scale ? closestH! : closestPt?.[1]! < 50 / scale ? closestPt! : [];
        if (this.rendered || closest) this.redraw();
        this.rendered = !!closest;
        if (closest) {
            if (!this.imageData) this.imageData = ctx.getImageData(0, 0, this.element.width, this.element.height);
            this.element.style.cursor = 'pointer';
            ctx.beginPath();
            ctx.fillStyle = this.config.points.highlighted.color;
            ctx.arc(closest.x, closest.y, this.config.points.highlighted.radius / scale, 0, Math.PI * 2);
            ctx.fill();
            this.latexContainer.render(closest.text, ...this.transform.toScreen(closest.x, closest.y));
            if ('slope' in closest) {
                const dx = this.config.points.highlighted.slopeLength / scale / Math.hypot(closest.slope!, 1);
                const dy = closest.slope! * dx;
                ctx.beginPath();
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1 / scale;
                ctx.moveTo(closest.x - dx, closest.y - dy);
                ctx.lineTo(closest.x + dx, closest.y + dy);
                ctx.stroke();
            }
        } else this.cancelMouseMove();
    }

    cancelMouseMove() {
        this.latexContainer.hide();
        this.element.style.cursor = '';
        if (this.rendered) this.redraw();
    }

    onTransform() {
        this.cancelMouseMove();
        this.imageData = undefined;
    }
}