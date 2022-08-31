type C = number[];

const util = {
    mod: (z: C) => Math.hypot(...z),
    arg: (z: C) => Math.atan2(z[1], z[0]),
    conjugate: (z: C) => [z[0], -z[1]],
    reciprocal: (z: C) => util.divide([1, 0], z),
    neg: (z: C) => [-z[0], -z[1]],
    add: (a: C, b: C) => [a[0] + b[0], a[1] + b[1]],
    subtract: (a: C, b: C) => [a[0] - b[0], a[1] - b[1]],
    multiply: (a: C, b: C) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
    divide: (a: C, b: C) => util.scale(util.multiply(a, util.conjugate(b)), 1 / (b[0] ** 2 + b[1] ** 2)),
    scale: (z: C, n: number) => [z[0] * n, z[1] * n],
    exp: (z: C) => util.scale([Math.cos(z[1]), Math.sin(z[1])], Math.exp(z[0])),
    ln: (z: C) => [Math.log(util.mod(z)), util.arg(z)],
    log: (a: C, b: C) => util.divide(util.ln(a), util.ln(b)),
    pow: (a: C, b: C) => util.exp(util.multiply(b, util.ln(a))),
    sin: (z: C) => util.divide(util.subtract(util.exp(z), util.exp(util.neg(z))), [0, 2]),
    cos: (z: C) => util.scale(util.add(util.exp(z), util.exp(util.neg(z))), 0.5),
};

export default util;