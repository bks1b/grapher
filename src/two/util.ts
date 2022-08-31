import { Coord } from '../types';

export const getCoordOrder = (arr: number[], axis: any) => <Coord>(axis ? arr.reverse() : arr);

export const vector = (ctx: CanvasRenderingContext2D, vec: number[], origin: number[], config: BaseVectorConfig) => {
    if (vec.every(x => !x)) return;
    const slope = vec[0] && vec[1] / vec[0];
    const dx = vec[0] && config.height / Math.sqrt(1 + slope ** 2) * Math.sign(vec[0]);
    const baseVec = [vec[0] - dx, vec[1] - (vec[0] ? dx * slope : config.height)];
    const norm = baseVec.map(x => x / Math.hypot(...baseVec));
    const tip = origin.map((x, i) => x + baseVec[i]);
    ctx.beginPath();
    ctx.strokeStyle = config.color;
    ctx.lineWidth = config.lineWidth;
    ctx.moveTo(...<Coord>origin);
    ctx.lineTo(...<Coord>tip);
    ctx.stroke();
    const baseW = config.base / 2 * norm[1];
    const baseH = config.base / 2 * norm[0];
    ctx.beginPath();
    ctx.fillStyle = config.color;
    ctx.moveTo(tip[0] + baseW, tip[1] - baseH);
    ctx.lineTo(tip[0] - baseW, tip[1] + baseH);
    ctx.lineTo(tip[0] + config.height * norm[0], tip[1] + config.height * norm[1]);
    ctx.lineTo(tip[0] + baseW, tip[1] - baseH);
    ctx.fill();
};

export const findSmallest = <T>(arr: T[], getValue: (x: T) => number): [T, number] | undefined => {
    let smallestIndex = 0;
    let smallestValue = Infinity;
    for (let i = 0; i < arr.length; i++) {
        const val = getValue(arr[i]);
        if (val < smallestValue) {
            smallestValue = val;
            smallestIndex = i;
        }
    }
    return arr.length ? [arr[smallestIndex], smallestValue] : undefined;
};

export type BaseVectorConfig = { color: string; } & Record<'lineWidth' | 'base' | 'height', number>;