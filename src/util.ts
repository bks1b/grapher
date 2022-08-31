import GraphConfig from './GraphConfig';
import { ComplexFunction, OptionalConfig } from './types';

export const EPSILON = 10 ** -10;
const PRECISION = 2;

export const assignConfig = <T>(def: OptionalConfig<T>, obj: OptionalConfig<T> = <OptionalConfig<T>>{}): T => <any>({
    ...obj,
    ...Object.fromEntries(Object.entries(def).flatMap(x => {
        const k = <keyof typeof obj>x[0].replace(/^_/, '');
        const v = k in obj ? obj[k] : x[1];
        return x[0] === k || k in obj ? [[k, typeof x[1] === 'object' && !Array.isArray(x[1]) ? assignConfig(x[1], v) : v]] : [];
    })),
});

export const generalMakeFunction = <
    G extends { config: { fns: Record<any, any> }; },
    F extends GraphConfig<G, any, any, any>,
>() => <C extends F, A1, A2>(Class: new (g: G, f: A1, c?: A2) => C) => (f: A1, c?: A2) => (g: G) => new Class(g, f, c);

export const format = (n: number) => Math.round(n * 10 ** PRECISION) / 10 ** PRECISION;
export const renderCoords = (...a: number[]) => `(${a.map(x => format(x)).join(',')})`;
export const renderVector = (...a: (string | number)[]) => `\\begin{align*}\\begin{bmatrix}${a.map(x => typeof x === 'string' ? x : format(x)).join('\\\\')}\\end{bmatrix}\\end{align*}`;

const renderComplexNumber = (z: number[]) => {
    const i = format(z[1]);
    return `${format(z[0])}${i < 0 ? '' : '+'}${i}i`;
};
export const getComplexText = (fn: ComplexFunction, w: number[], r: number, i: number, mod: number, arg: number) => {
    const dr = fn([r + EPSILON, -i]);
    return `${renderComplexNumber([r, -i])}\\mapsto${renderComplexNumber(w)}\\\\|w|=${format(mod)}\\quad\\arg w=${format(arg)}\\quad\\frac{d}{dz}=${renderComplexNumber([(dr[0] - w[0]) / EPSILON, (dr[1] - w[1]) / EPSILON])}`;
};

export const sigmoid = (n: number) => 1 / (Math.exp(n) + 1);
export const positiveSigmoid = (n: number) => 2 / (Math.exp(-n) + 1) - 1;

export const getRGB = (n: number) => [(18 * n - 4) ** 2 + 49.5, 245 - 178.5 * n, 245 - 637.5 * (n - 0.5) ** 2];

export const isUndef = (n: any) => isNaN(n) || !isFinite(n);