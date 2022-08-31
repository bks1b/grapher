import GraphConfig from './GraphConfig';

export type Coord = [number, number];

export type OptionalConfig<T> = T extends object ? T extends Array<any> ? T : T extends (...a: any[]) => any ? T : { [k in keyof T]?: OptionalConfig<T[k]>; } : T;

export type ComplexFunction = (z: number[]) => number[];

export type BaseGrapher<K extends string | number | symbol> = { config: { fns: Record<K, any> }; };

export type InputFunction<T extends BaseGrapher<any>, B extends GraphConfig<T, any>> = ((g: T) => B)[];