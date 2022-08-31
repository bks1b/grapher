import { Intersection, Mesh, MeshBasicMaterial, Object3D, Raycaster, SphereGeometry, Vector2 } from 'three';
import { LatexContainer } from '../../katex';
import { InputFunction, OptionalConfig } from '../../types';
import { assignConfig } from '../../util';
import BaseGraph from '../BaseGraph';
import { BaseConfig, GrapherConfig, HelperConfig, PointData } from '../types';
import SceneHelper from './SceneHelper';

export default class Grapher extends SceneHelper {
    raycaster = new Raycaster();
    latexContainer: LatexContainer;
    selectedPoint: Mesh;
    fns: BaseGraph<any>[];
    intersectionObj?: Object3D;
    config!: BaseConfig & HelperConfig & GrapherConfig;
    constructor(
        container: HTMLElement,
        fns: InputFunction<Grapher, BaseGraph<any>>,
        config: OptionalConfig<GrapherConfig> = {},
        helperConfig: OptionalConfig<HelperConfig> = {},
        baseConfig: OptionalConfig<BaseConfig> = {},
    ) {
        super(container, helperConfig, baseConfig);
        Object.assign(this.config, assignConfig<GrapherConfig>({
            points: {
                threshold: 0.1,
                radius: 0.05,
                widthSegments: 32,
                heightSegments: 16,
                color: 0,
            },
            fns: {
                surface: {
                    opacity: 0.8,
                    divisions: 50,
                    wireColor: 0xffffff,
                    sigmoidScale: 2,
                    plane: {
                        size: 1,
                        color: 0xffffff,
                    },
                    zBounds: [-20, 20],
                },
                curve: {
                    color: 0,
                    segments: 500,
                    radius: 0.01,
                    radiusSegments: 10,
                    tangent: {
                        length: 1,
                        sigmoidScale: 15,
                        lineWidth: 0.003,
                        radius: 0.05,
                        height: 0.1,
                        segments: 10,
                    },
                },
                vectorField: {
                    step: 1.8,
                    length: 0.8,
                    sigmoidScale: 10,
                    lineWidth: 0.003,
                    radius: 0.05,
                    height: 0.1,
                    segments: 10,
                },
                flowCurves: {
                    step: 3,
                    sigmoidScale: 15,
                    arclength: 5,
                    minNorm: 0.01,
                    lineWidth: 0.0015,
                    accuracy: 0.01,
                    radius: 0.05,
                    height: 0.1,
                    segments: 10,
                },
                lineIntegral: {
                    step: 0.1,
                    color: 0xff0000,
                },
                doubleIntegral: {
                    intervalStep: 0.1,
                    curveStep: 0.1,
                    intervalAxis: 'x',
                    color: 0xff0000,
                },
            },
        }, config));
        container.style.position = 'relative';
        this.latexContainer = new LatexContainer(container);
        this.fns = fns.map(f => f(this));
        this.graph();
        this.initHelpers();
        this.raycaster.params.Points!.threshold = this.config.points.threshold;
        this.selectedPoint = new Mesh(
            new SphereGeometry(this.config.points.radius, this.config.points.widthSegments, this.config.points.heightSegments),
            new MeshBasicMaterial({ color: this.config.points.color }),
        );
        this.selectedPoint.visible = false;
        this.scene.add(this.selectedPoint);
    }

    mouseMove(e: MouseEvent) {
        this.cancelMouseMove();
        this.raycaster.setFromCamera(new Vector2(e.offsetX / this.config.width * 2 - 1, 1 - e.offsetY / this.config.height * 2), this.camera);
        const data = this.fns.map(fn => {
            const inters = this.raycaster.intersectObject(fn.raycast);
            if (inters.length) return <[Intersection, PointData]>[inters[0], fn.getPoint(inters[0])];
        }).find(x => x?.[0]) || this.vectors.map(x => <[Intersection, PointData]>[this.raycaster.intersectObject(x[0])[0], x[1]]).find(x => x[0]);
        if (data) {
            this.latexContainer.render(data[1].text, e.offsetX, e.offsetY);
            this.selectedPoint.position.set(...data[1].point ? <const>[data[1].point[0], data[1].point[2], -data[1].point[1]] : data[0].point.toArray());
            this.selectedPoint.visible = true;
            if (data[1].obj) this.scene.add(this.intersectionObj = data[1].obj);
        }
    }

    cancelMouseMove() {
        if (this.intersectionObj) this.scene.remove(this.intersectionObj);
        this.selectedPoint.visible = false;
        this.latexContainer.hide();
    }

    graph() {
        for (const fn of this.fns) fn.graph();
    }
}