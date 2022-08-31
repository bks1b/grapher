import { getRGB } from '../../util';

export const getColor = (n: number) => `rgb(${getRGB(n).join(',')})`;

export const roundCoords = (c: number[], n: number) => c.map(x => Math.round(x / n) * n).join(',');