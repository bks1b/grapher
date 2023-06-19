import { DoubleSide, Float32BufferAttribute, Intersection, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3, WireframeGeometry } from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';
import { ComplexFunction, OptionalConfig } from '../../types';
import { EPSILON, getComplexText, isUndef, renderCoords, renderVector, sigmoid } from '../../util';
import BaseGraph from '../BaseGraph';
import Grapher from '../lib/Grapher';
import { Coord3, Fns } from '../types';
import { getColor, mesh } from '../util';
import math from '../../math';

export class Surface<T = unknown> extends BaseGraph<'surface', Coord3> {
    static key = 'surface';

    config!: Fns['surface'] & T;

    clampZ(z: number) {
        return Math.min(this.config.zBounds[1], Math.max(z, this.config.zBounds[0]));
    }

    getCoord(n: number, k: 'u' | 'v') {
        const range = this.config[`${k}Range`];
        return n * (range[1] - range[0]) + range[0];
    }

    graph() {
        let firstVec: Vector3;
        const colors: number[] = [];
        const geometry = new ParametricGeometry((u, v, vec) => {
            if (!firstVec) firstVec = vec;
            u = this.getCoord(u, 'u');
            v = this.getCoord(v, 'v');
            const val = this.fn(u, v);
            const color = this.getColor(val);
            if (firstVec === vec) colors.push(...getColor(isUndef(color) ? 0 : sigmoid(color / this.config.sigmoidScale)));
            vec.set(...<Coord3>[val[0], this.clampZ(val[2]), -val[1]].map(c => isUndef(c) ? 0 : c));
        }, this.config.divisions, this.config.divisions);
        geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
        this.grapher.scene.add(
            this.raycast = new Mesh(geometry, mesh(this.config.opacity, { vertexColors: true })),
            new LineSegments(new WireframeGeometry(geometry), new LineBasicMaterial({ color: this.config.wireColor, side: DoubleSide })),
        );
    }

    getPlane(inter: Intersection) {
        const plane = new Mesh(new PlaneGeometry(this.config.plane.size, this.config.plane.size), new MeshBasicMaterial({ color: this.config.plane.color, side: DoubleSide }));
        plane.position.copy(inter.point);
        plane.lookAt(inter.face!.normal.add(inter.point));
        return plane;
    }

    getColor(c: Coord3) {
        return c[2];
    }

    getPoint(inter: Intersection) {
        const u = this.getCoord(inter.uv!.x, 'u');
        const v = this.getCoord(inter.uv!.y, 'v');
        const val = this.fn(u, v);
        return val.some(x => isUndef(x)) ? undefined : {
            point: [val[0], val[1], this.clampZ(val[2])],
            text: `${renderCoords(u, v)}\\mapsto ${renderCoords(...val)}\\\\${['u', 'v'].map((c, i) => `\\frac{\\partial}{\\partial ${c}}=${renderVector(...this.fn(u + (1 - i) * EPSILON, v + i * EPSILON).map((n, i) => (n - val[i]) / EPSILON))}`).join('\\quad')}`,
            obj: this.getPlane(inter),
        };
    }
}

export class Scalar extends Surface {
    constructor(grapher: Grapher, fn: (x: number, y: number) => number, config: OptionalConfig<Fns['surface']> = {}) {
        super(grapher, (u, v) => [u, v, fn(u, v)], config);
    }

    getPoint(inter: Intersection) {
        const { x, z: y } = inter.point;
        const z = this.fn(x, -y)[2];
        if ([x, y, z].some(x => isUndef(x))) return;
        return {
            point: [x, -y, this.clampZ(z)],
            text: `${renderCoords(x, -y, z)}\\\\\\text{grad}=${renderVector((this.fn(x + EPSILON, -y)[2] - z) / EPSILON, (this.fn(x, -y + EPSILON)[2] - z) / EPSILON)}`,
            obj: this.getPlane(inter),
        };
    }
}

export class ComplexScalar extends Surface<{ z: 're' | 'im'; }> {
    zIndex: number;
    cIndex: number;
    constructor(grapher: Grapher, private complexFn: ComplexFunction, config: OptionalConfig<Fns['surface'] & { z: 're' | 'im'; }> = {}) {
        super(grapher, (r, i) => [r, i, complexFn([r, i])[this.zIndex]], <Fns['surface']>{ ...config, z: config.z || 're' });
        [this.zIndex, this.cIndex] = this.config.z === 're' ? [0, 1] : [1, 0];
    }

    getColor(c: Coord3) {
        return this.complexFn([c[0], c[1]])[this.cIndex];
    }

    getPoint(inter: Intersection) {
        const { x: r, z: i } = inter.point;
        const val = this.complexFn([r, -i]);
        if (val.some(x => isUndef(x))) return;
        return {
            point: [r, -i, this.clampZ(val[this.zIndex])],
            text: getComplexText(this.complexFn, val, r, i, math.mod(val), math.arg(val)),
            obj: this.getPlane(inter),
        };
    }
}