import { Object3D } from 'three';
import { Coord } from '../types';

export type ColorType = number;

export type Fns = {
    surface: Record<'opacity' | 'divisions' | 'sigmoidScale', number>
        & { plane: { size: number; color: ColorType; }; wireColor: ColorType; }
        & Record<'uRange' | 'vRange' | 'zBounds', Coord>;
    curve: Record<'segments' | 'radius' | 'radiusSegments', number> & {
        tangent: NormalizedVectorConfig;
        color: ColorType;
        cartesian: boolean;
        hideZ: boolean;
        range: Coord;
    };
    vectorField: { length: number; };
    flowCurves: Record<'arclength' | 'minNorm' | 'accuracy', number>;
    lineIntegral: { curve: (t: number) => Coord; color: ColorType; step: number; range: Coord; };
    doubleIntegral: Record<'intervalStep' | 'curveStep', number> & {
        color: ColorType;
        intervalAxis: 'x' | 'y';
        interval: Coord;
        curves: (t: number) => Coord;
    };
} & Record<'vectorField' | 'flowCurves', Record<'xRange' | 'yRange' | 'zRange', Coord> & Record<'step' | 'sigmoidScale', number> & BaseVectorConfig>;

export type GrapherConfig = {
    points: Record<'threshold' | 'radius' | 'widthSegments' | 'heightSegments', number> & { color: ColorType; };
    fns: Fns;
};

export type HelperConfig = {
    axes: Record<'fontSize' | 'labelOffset' | 'numberOffset' | 'lineWidth', number>
        & Record<'x' | 'y', { label: string; gap: number; }>
        & { arrows: Record<'radius' | 'height' | 'segments', number> & { color: ColorType; }; }
        & { fontColor: string; color: ColorType; };
} & Record<'xRange' | 'yRange', Coord> & { vectors: VectorConfig; crossProducts: { opacity: number; color: ColorType; }; };

export type BaseConfig = Record<'fov' | 'near' | 'far' | 'width' | 'height', number> & { background: ColorType; position: Coord3; };

export type BaseVectorConfig = {
    lineWidth: number;
    radius: number;
    height: number;
    segments: number;
};
export type VectorConfig = BaseVectorConfig & { color: ColorType; };
export type NormalizedVectorConfig = BaseVectorConfig & Record<'sigmoidScale' | 'length', number>;

export type Coord3 = [number, number, number];

export type PointData = {
    point?: number[];
    text: string;
    obj?: Object3D;
};