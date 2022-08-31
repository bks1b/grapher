import SpriteText from 'three-spritetext';
import { BufferGeometry, ConeGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { assignConfig, renderVector } from '../../util';
import { BaseConfig, Coord3, HelperConfig, PointData } from '../types';
import { OptionalConfig } from '../../types';
import { mesh, vector } from '../util';
import BaseScene from './BaseScene';

export default class extends BaseScene {
    config!: BaseConfig & HelperConfig;
    vectors: [Object3D, PointData][] = [];
    constructor(container: HTMLElement, config: OptionalConfig<HelperConfig> = {}, baseConfig: OptionalConfig<BaseConfig> = {}) {
        super(container, baseConfig);
        Object.assign(this.config, assignConfig<HelperConfig>({
            axes: {
                fontSize: 0.2,
                fontColor: 'black',
                labelOffset: 0.2,
                numberOffset: -0.2,
                color: 0,
                lineWidth: 0.002,
                x: {
                    label: 'x',
                    gap: 1,
                },
                y: {
                    label: 'y',
                    gap: 1,
                },
                arrows: {
                    radius: 0.075,
                    height: 0.2,
                    segments: 10,
                    color: 0,
                },
            },
            vectors: {
                color: 0,
                lineWidth: 0.003,
                radius: 0.05,
                height: 0.1,
                segments: 10,
            },
            crossProducts: {
                opacity: 0.5,
                color: 0xff0000,
            },
        }, config));
        for (const [t, p] of <[string, Coord3][]>[
            [this.config.axes.x.label, [this.maxX, this.config.axes.labelOffset, 0]],
            [this.config.axes.y.label, [0, this.config.axes.labelOffset, -this.maxY]],
            ...(<const>['x', 'y']).flatMap((c, i) => Array.from({ length: this[`${c}Range`] / this.config.axes[c].gap + 1 }, (_, j) => {
                const n = j * this.config.axes[c].gap + this.config[`${c}Range`][i] * (-1) ** i;
                return [n * (-1) ** i + '', [i ? 0 : n, this.config.axes.numberOffset, i ? n : 0]];
            })),
        ]) {
            const obj = new SpriteText(t, this.config.axes.fontSize, this.config.axes.fontColor);
            obj.renderOrder = 2;
            obj.onBeforeRender = r => r.clearDepth();
            obj.position.set(...p);
            this.scene.add(obj);
        }
    }

    initHelpers() {
        this.scene.add(...[[0, 0, -this.maxY, 0, 0, -this.minY], [this.minX, 0, 0, this.maxX, 0, 0]].map(pos => new Line2(new LineGeometry().setPositions(pos), new LineMaterial({ color: this.config.axes.color, linewidth: this.config.axes.lineWidth }))));
        this.scene.add(...[
            [[this.maxX, 0, 0], [Math.PI / 2, 0, -Math.PI / 2]],
            [[0, 0, -this.maxY], [-Math.PI / 2, 0, 0]],
        ].map(([pos, rot]) => {
            const cone = new Mesh(
                new ConeGeometry(this.config.axes.arrows.radius, this.config.axes.arrows.height, this.config.axes.arrows.segments),
                new MeshBasicMaterial({ color: this.config.axes.arrows.color }),
            );
            cone.position.set(...<Coord3>pos);
            cone.rotation.set(...<Coord3>rot);
            return cone;
        }));
    }

    renderVector(vec: Coord3, origin: Coord3 = [0, 0, 0]) {
        const obj = vector([vec[0], vec[2], -vec[1]], origin, this.config.vectors);
        this.scene.add(obj);
        this.vectors.push([obj, { point: [vec[0], vec[1], vec[2]], text: renderVector(...vec) }]);
    }

    renderCrossProduct(v1: Coord3, v2: Coord3) {
        this.renderVector(v1);
        this.renderVector(v2);
        const p = new Vector3(...v1).cross(new Vector3(...v2));
        this.renderVector(p.toArray());
        const sum = v1.map((x, i) => x + v2[i]);
        const geom = new BufferGeometry();
        geom.setAttribute('position', new Float32BufferAttribute([0, 0, 0, ...[v1, sum, v2, sum].flatMap(x => [x[0], x[2], -x[1]]), 0, 0, 0], 3));
        this.scene.add(new Mesh(geom, mesh(this.config.crossProducts.opacity, { color: this.config.crossProducts.color })));
    }

    get minX() {
        return this.config.xRange[0];
    }

    get minY() {
        return this.config.yRange[0];
    }

    get maxX() {
        return this.config.xRange[1];
    }

    get maxY() {
        return this.config.yRange[1];
    }

    get xRange() {
        return this.config.xRange[1] - this.minX;
    }

    get yRange() {
        return this.config.yRange[1] - this.minY;
    }
}