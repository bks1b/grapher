import { Grapher3, complexScalar } from '../../src/three';
import math from '../../src/math';

const grapher = new Grapher3(document.getElementById('container')!, [complexScalar(math.gamma, { uRange: [-10, 10], vRange: [-10, 10] })], {}, { xRange: [-10, 10], yRange: [-10, 10] });
window.onresize = () => grapher.resize();