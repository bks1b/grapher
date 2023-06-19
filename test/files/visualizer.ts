import { Scene } from '../../src/two/visualizer';
import { TrapezoidalSum } from '../../src/two/visualizer/objects/sums';

const range = <[number, number]>[-7, 7];

const el = document.createElement('div');
document.body.appendChild(el);
const scene = new Scene(el);
scene.createSliders((a, b, n) => {
    scene.init();
    const sum = new TrapezoidalSum(scene, x => Math.sin(x), { fnRange: range, sumRange: [a, b], n });
    scene.preRender();
    sum.render();
}, [
    { label: 'a', range, val: -3, step: 0.001 },
    { label: 'b', range, val: 3, step: 0.001 },
    { label: 'n', range: [1, range[1] - range[0]], val: 6, step: 1 },
]);