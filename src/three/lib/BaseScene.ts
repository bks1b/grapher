import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OptionalConfig } from '../../types';
import { assignConfig } from '../../util';
import { BaseConfig, Coord3 } from '../types';

export default class {
    scene = new Scene();
    renderer = new WebGLRenderer();
    camera: PerspectiveCamera;
    config: BaseConfig;
    constructor(protected container: HTMLElement, config: OptionalConfig<BaseConfig> = {}) {
        this.config = assignConfig<BaseConfig>({
            fov: 75,
            background: 0xffffff,
            near: 0.1,
            far: 1000,
            position: [0, 1, 3],
        }, config);
        this.camera = new PerspectiveCamera(this.config.fov, 1, this.config.near, this.config.far);
        this.camera.aspect = config.width! / config.height!;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(config.width!, config.height!);
        this.renderer.setClearColor(this.config.background, 1);
        this.camera.position.set(...<Coord3>this.config.position);
        new OrbitControls(this.camera, this.renderer.domElement);
        this.renderer.domElement.style.display = '';
        container.appendChild(this.renderer.domElement);
        window.addEventListener('mousemove', e => {
            if (e.target === this.renderer.domElement) this.mouseMove?.(e);
            else this.cancelMouseMove?.();
        });
        const render = () => {
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    mouseMove?(e: MouseEvent): void;
    cancelMouseMove?(): void;
}