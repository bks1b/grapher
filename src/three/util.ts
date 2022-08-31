import { Color, ConeGeometry, DoubleSide, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { getRGB, positiveSigmoid } from '../util';
import { Coord3, NormalizedVectorConfig, VectorConfig } from './types';

export const getColor = (n: number) => getRGB(n).map(x => x / 255);
export const getNormColor = (n: number) => new Color(...getColor(positiveSigmoid(n))).getHex();

export const vector = (vec: number[], origin: number[], config: VectorConfig) => {
    const norm = new Vector3(...vec).normalize();
    const tipCoords = origin.map((x, i) => x + vec[i]);
    const line = new Line2(new LineGeometry().setPositions([...origin, ...tipCoords]), new LineMaterial({ color: config.color, linewidth: config.lineWidth }));
    const tip = new Mesh(new ConeGeometry(config.radius, config.height, config.segments), new MeshBasicMaterial({ color: config.color }));
    tip.position.set(...<Coord3>tipCoords);
    tip.quaternion.setFromAxisAngle(new Vector3(norm.z, 0, -norm.x).normalize(), Math.acos(norm.y));
    line.add(tip);
    return line;
};
export const normalizedVector = (vec: number[], origin: number[], config: NormalizedVectorConfig) => {
    const norm = Math.hypot(...vec);
    return vector(vec.map(x => x * config.length / norm), origin, { ...config, color: getNormColor(norm / config.sigmoidScale) });
};

export const mesh = (opacity: number, obj?: MeshBasicMaterialParameters) => new MeshBasicMaterial({
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    transparent: opacity !== 1,
    opacity,
    ...obj,
});