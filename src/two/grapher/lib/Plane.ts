import { assignConfig } from '../../../util';
import { PlaneConfig } from '../types';
import { Coord, OptionalConfig } from '../../../types';
import CanvasHelper from './CanvasHelper';

export default abstract class extends CanvasHelper {
    config: PlaneConfig;
    constructor(element: HTMLCanvasElement, config: OptionalConfig<PlaneConfig> = {}) {
        super(element, config.background);
        element.style.touchAction = 'none'; 
        this.config = assignConfig<PlaneConfig>({
            zoomRate: 1.3,
            mobileZoomRate: 1.005,
            initialZoom: 30,
            centered: true,
        }, config);
        requestAnimationFrame(() => {
            if (this.config.centered) this.transform.translate(element.width / 2, element.height / 2);
            this.transform.scale(this.config.initialZoom);
            this.attachEvents();
        });
    }

    zoom(x: number, y: number, scale: number) {
        this.transform.overrideInitial(() => {
            this.transform.translate(x, y);
            this.transform.scale(scale);
            this.transform.translate(-x, -y);
        });
        this.forceRender?.();
    }

    attachEvents() {
        let lastPos: Coord | undefined;
        let pointers: PointerEvent[] = [];
        let lastDist = 0;
        const pointerCancel = (e: PointerEvent) => {
            lastPos = undefined;
            pointers = pointers.filter(p => p.pointerId !== e.pointerId);
            lastDist = 0;
        };
        this.element.addEventListener('pointerdown', e => {
            lastPos = this.getMouseCoords(e);
            pointers.push(e);
        });
        this.element.addEventListener('pointermove', e => {
            if (e.target !== this.element) return this.cancelMouseMove?.();
            if (pointers.length === 2) {
                pointers[pointers.findIndex(p => p.pointerId === e.pointerId)] = e;
                const [x1, y1] = this.getMouseCoords(pointers[0]);
                const [x2, y2] = this.getMouseCoords(pointers[1]);
                const dist = Math.hypot(x1 - x2, y1 - y2);
                if (lastDist) this.zoom((x1 + x2) / 2, (y1 + y2) / 2, this.config.mobileZoomRate ** (dist - lastDist));
                lastDist = dist;
            } else if (lastPos) {
                const coords = this.getMouseCoords(e);
                this.transform.translate(...<Coord>coords.map((x, i) => (x - lastPos![i]) / this.transform.scalar));
                lastPos = coords;
                this.forceRender?.();
            } else this.mouseMove?.(e);
        });
        this.element.addEventListener('pointerup', pointerCancel);
        this.element.addEventListener('pointercancel', pointerCancel);
        this.element.addEventListener('wheel', e => {
            e.preventDefault();
            this.zoom(...this.getMouseCoords(e), this.config.zoomRate ** -Math.sign(e.deltaY));
        });
    }

    abstract mouseMove?(e: MouseEvent): any;
    abstract cancelMouseMove?(): any;
}