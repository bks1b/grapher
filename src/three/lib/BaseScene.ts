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
    width = 0;
    height = 0;
    constructor(protected container: HTMLElement, config: OptionalConfig<BaseConfig> = {}) {
        this.config = assignConfig<BaseConfig>({
            fov: 75,
            background: 0xffffff,
            near: 0.1,
            far: 1000,
            position: [0, 1, 3],
        }, config);
        this.camera = new PerspectiveCamera(this.config.fov, 1, this.config.near, this.config.far);
        this.renderer.setClearColor(this.config.background, 1);
        this.camera.position.set(...<Coord3>this.config.position);
        new OrbitControls(this.camera, this.renderer.domElement);
        this.renderer.domElement.style.display = '';
        container.appendChild(this.renderer.domElement);
        this.resize();
        this.renderer.domElement.addEventListener('mousemove', e => {
            if (e.target === this.renderer.domElement) this.mouseMove?.(e);
            else this.cancelMouseMove?.();
        });
        const render = () => {
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    resize(r = true) {
        const { width, height } = this.container.getBoundingClientRect();
        this.width = width;
        this.height = height;
        this.renderer.setSize(width, height);
        if (r) this.resize(false);
        else {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    mouseMove?(e: MouseEvent): void;
    cancelMouseMove?(): void;
}