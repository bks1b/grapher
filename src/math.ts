import { EPSILON } from './util';

const GAMMA_N = 7;
const GAMMA_C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

const factorials = [1];

const math = {
    derivative: (f: (z: C) => C, n = 1) => (z: C) => {
        let r = [0, 0];
        for (let i = 0; i <= n; i++) r = math.add(r, math.scale(f(math.add(z, [(n - i) * EPSILON, 0])), math.binom([n, 0], i)[0] * (i % 2 === 0 ? 1 : -1) * EPSILON ** -n));
        return r;
    },
    e: [Math.E, 0],
    pi: [Math.PI, 0],
    eGamma: [0.5772156649, 0],
    mod: (z: C) => Math.hypot(...z),
    arg: (z: C) => Math.atan2(z[1], z[0]),
    conjugate: (z: C) => [z[0], -z[1]],
    reciprocal: (z: C) => math.divide([1, 0], z),
    neg: (z: C) => [-z[0], -z[1]],
    add: (a: C, b: C) => [a[0] + b[0], a[1] + b[1]],
    subtract: (a: C, b: C) => [a[0] - b[0], a[1] - b[1]],
    multiply: (a: C, b: C) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
    divide: (a: C, b: C) => math.scale(math.multiply(a, math.conjugate(b)), 1 / (b[0] ** 2 + b[1] ** 2)),
    scale: (z: C, n: number) => [z[0] * n, z[1] * n],
    exp: (z: C) => math.scale([Math.cos(z[1]), Math.sin(z[1])], Math.exp(z[0])),
    ln: (z: C) => [Math.log(math.mod(z)), math.arg(z)],
    log: (a: C, b: C) => math.divide(math.ln(a), math.ln(b)),
    pow: (a: C, b: C) => a[0] || a[1] ? math.exp(math.multiply(b, math.ln(a))) : b[0] || b[1] ? [0, 0] : [1, 0],
    sin: (z: C) => math.divide(math.subtract(math.exp(math.multiply(z, [0, 1])), math.exp(math.multiply(z, [0, -1]))), [0, 2]),
    cos: (z: C) => math.scale(math.add(math.exp(math.multiply(z, [0, 1])), math.exp(math.multiply(z, [0, -1]))), 0.5),
    factorial: (n: number): number => n >= 0 && Number.isInteger(n) ? factorials[n] || (factorials[n] = n * math.factorial(n - 1)) : 0,
    rising: (z: C, k: number) => {
        let r = [1, 0];
        for (let i = 1; i <= k; i++) r = math.multiply(r, math.add(z, [i - 1, 0]));
        return r;
    },
    falling: (z: C, k: number) => {
        let r = [1, 0];
        for (let i = 1; i <= k; i++) r = math.multiply(r, math.add(z, [1 - i, 0]));
        return r;
    },
    binom: (z: C, k: number) => {
        let r = [1, 0];
        for (let i = 1; i <= k; i++) r = math.multiply(r, math.scale(math.add(z, [1 - i, 0]), 1 / i));
        return r;
    },
    gamma: (z: C): C => {
        if (z[0] < 0.5) return math.divide(math.pi, math.multiply(math.sin(math.scale(z, Math.PI)), math.gamma(math.subtract([1, 0], z))));
        let x = [GAMMA_C[0], 0];
        for (let i = 1; i < GAMMA_C.length; i++) x = math.add(x, math.divide([GAMMA_C[i], 0], math.add(z, [i - 1, 0])));
        const t = math.add(z, [GAMMA_N - 0.5, 0]);
        return math.scale(math.multiply(math.pow(t, math.subtract(z, [0.5, 0])), math.multiply(math.exp(math.neg(t)), x)), Math.sqrt(2 * Math.PI));
    },
    polygamma: (z: C, n: number) => math.derivative(s => math.ln(math.gamma(s)), n)(z),
    harmonic: (z: C) => math.subtract(math.polygamma(math.add(z, [1, 0]), 1), math.polygamma([1, 0], 1)),
    bernoulli: (z: C, n: number) => {
        let r = [0, 0];
        for (let k = 0; k <= n; k++) for (let j = 0; j <= k; j++) r = math.add(r, math.scale(math.pow(math.add(z, [j, 0]), [n, 0]), (j % 2 === 0 ? 1 : -1) * math.binom([k, 0], j)[0] / (k + 1)));
        return r;
    },
    fib: (z: C) => math.scale(math.subtract(math.pow([(1 + Math.sqrt(5)) / 2, 0], z), math.pow([(1 - Math.sqrt(5)) / 2, 0], z)), 1 / Math.sqrt(5)),
};

export default math;

type C = number[];