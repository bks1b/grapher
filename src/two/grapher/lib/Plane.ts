import { assignConfig } from '../../../util';
import { PlaneConfig } from '../types';
import { Coord, OptionalConfig } from '../../../types';
import CanvasHelper from './CanvasHelper';

export default abstract class extends CanvasHelper {
    config: PlaneConfig;
    constructor(element: HTMLCanvasElement, config: OptionalConfig<PlaneConfig> = {}) {
        super(element, config.background);
        this.config = assignConfig<PlaneConfig>({
            zoomRate: 1.3,
            initialZoom: 30,
            centered: true,
        }, config);
        requestAnimationFrame(() => {
            if (this.config.centered) this.transform.translate(element.width / 2, element.height / 2);
            this.transform.scale(this.config.initialZoom);
            this.attachEvents();
        });
    }

    attachEvents() {
        let lastPos: Coord | undefined;
        this.element.addEventListener('mousedown', e => lastPos = this.getMouseCoords(e));
        window.addEventListener('mousemove', e => {
            if (e.target !== this.element) return this.cancelMouseMove?.();
            if (lastPos) {
                const coords = this.getMouseCoords(e);
                this.transform.translate(...<Coord>coords.map((x, i) => (x - lastPos![i]) / this.transform.scalar));
                lastPos = coords;
                this.forceRender?.();
            } else this.mouseMove?.(e);
        });
        this.element.addEventListener('mouseup', () => lastPos = undefined);
        this.element.addEventListener('wheel', e => {
            e.preventDefault();
            const [x, y] = this.getMouseCoords(e);
            const scale = this.config.zoomRate ** -Math.sign(e.deltaY);
            this.transform.overrideInitial(() => {
                this.transform.translate(x, y);
                this.transform.scale(scale);
                this.transform.translate(-x, -y);
            });
            this.forceRender?.();
        });
    }

    abstract mouseMove?(e: MouseEvent): any;
    abstract cancelMouseMove?(): any;
}