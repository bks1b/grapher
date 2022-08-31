import { generalMakeFunction } from '../util';
import { Coord, InputFunction, OptionalConfig } from '../types';
import { getCoordOrder } from '../two/util';
import { Curve, Curve2D, Cartesian } from './graphs/curve';
import { ComplexScalar, Scalar, Surface } from './graphs/surface';
import { FlowCurves, VectorField } from './graphs/vector';
import { LineIntegral, DoubleIntegral } from './graphs/integral';
import Grapher from './lib/Grapher';
import BaseGraph from './BaseGraph';
import { Fns } from './types';

const makeFunction = generalMakeFunction<Grapher, BaseGraph<any, any>>();

export const surface = makeFunction(Surface);
export const scalar = makeFunction(Scalar);
export const complexScalar = makeFunction(ComplexScalar);
export const curve = makeFunction(Curve);
export const curve2d = makeFunction(Curve2D);
export const cartesian = makeFunction(Cartesian);
export const vectorField = makeFunction(VectorField);
export const flowCurves = makeFunction(FlowCurves);
export const baseLineIntegral = makeFunction(LineIntegral);
export const baseDoubleIntegral = makeFunction(DoubleIntegral);

export const lineIntegral = (
    fn: (...a: number[]) => number,
    curve: (t: number) => Coord,
    range: Coord,
    config: OptionalConfig<Fns['lineIntegral']> = {},
    fnConfig: OptionalConfig<Fns['surface']> = {},
    curveConfig: OptionalConfig<Fns['curve']> = {},
) => <InputFunction<Grapher, BaseGraph<any>>>[
    scalar(fn, fnConfig),
    curve2d(curve, { range, ...curveConfig }),
    baseLineIntegral(fn, { curve, range, ...config }),
];
export const doubleIntegral = (
    fn: (...a: number[]) => number,
    curves: ((t: number) => Coord) | Coord,
    interval: Coord,
    intervalAxis: 'x' | 'y' = 'x',
    config: OptionalConfig<Fns['doubleIntegral']> = {},
    fnConfig: OptionalConfig<Fns['surface']> = {},
    curveConfig: OptionalConfig<Fns['curve']> = {},
) => <InputFunction<Grapher, BaseGraph<any>>>[
    scalar(fn, fnConfig),
    ...curves instanceof Array ? [] : [0, 1].map(i => curve2d(t => getCoordOrder([t, curves(t)[i]], intervalAxis === 'y'), { range: interval, ...curveConfig })),
    baseDoubleIntegral(fn, { curves: curves instanceof Array ? () => curves : curves, intervalAxis, interval, ...config }),
];

export { Grapher as Grapher3 };
export { default as SceneHelper } from './lib/SceneHelper';
export { default as BaseScene } from './lib/BaseScene';
export { vector, normalizedVector } from './util';