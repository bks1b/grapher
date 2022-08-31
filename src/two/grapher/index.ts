import { generalMakeFunction } from '../../util';
import { Cartesian, Parametric, Polar } from './graphs/curve';
import { ComplexScalar, Inequality, PolyaField, Scalar, VectorField } from './graphs/other';
import Grapher from './lib/Grapher';
import BaseGraph from './BaseGraph';

const makeFunction = generalMakeFunction<Grapher, BaseGraph<any, any, any>>();

export const cartesian = makeFunction(Cartesian);
export const parametric = makeFunction(Parametric);
export const polar = makeFunction(Polar);
export const inequality = makeFunction(Inequality);
export const scalar = makeFunction(Scalar);
export const complexScalar = makeFunction(ComplexScalar);
export const vectorField = makeFunction(VectorField);
export const polyaField = makeFunction(PolyaField);

export { Grapher as Grapher2 };