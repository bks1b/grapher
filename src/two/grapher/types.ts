import { Coord } from '../../types';
import { BaseVectorConfig } from '../util';

export type PlaneConfig = Record<'zoomRate' | 'initialZoom', number> & { centered: boolean; background: string; };
export type CartesianConfig = { polar: boolean; }
    & Record<'axes' | 'grid' | 'minorGrid', { width: number; color: string; }>
    & {
        minorGrid: Record<'density' | 'angleStep', number>;
        labels: Record<'minSize' | 'base' | 'margin' | 'padding', number>
            & {
                reducers: number[];
                background: { color: string; opacity: 1; };
                font: { color: string; size: number; family: string; };
            };
    };

export type Fns = Record<'cartesian' | 'parametric' |'polar', { color: string; } & Record<'step' | 'lineWidth' | 'maxSlope', number>> & Record<'parametric' | 'polar', { range: Coord; }>
    & Record<'scalar' | 'complexScalar', Record<'step' | 'opacity', number>>
    & {
        cartesian: { inverse: boolean; };
        vectorField: Record<'step' | 'length' | 'sigmoidScale', number> & Exclude<BaseVectorConfig, 'color'>;
        inequality: Record<'step' | 'opacity', number> & { color: string; };
        scalar: { sigmoidScale: number; };
        complexScalar: Record<'mod' | 'minLum' | 'maxLum' | 'logScale', number>;
    };
export type GrapherConfig = {
    width: number;
    height: number;
    points: {
        radius: 5;
        color: string;
        zeroes: Record<'maxVal' | 'minSlope', number>;
        turningPoints: Record<'maxSlope' | 'minCurvature', number>;
        highlighted: { color: string; } & Record<'slopeLength' | 'radius', number>;
        intersections: Record<'maxDistance' | 'minSlopeDiff', number>;
    } & Record<'zeroes' | 'turningPoints' | 'intersections', { show: boolean; round: number; }>;
    fns: Fns;
};

export type Point = { x: number; y: number; text: string; slope?: number; };