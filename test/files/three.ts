import { Grapher3, complexScalar } from '../../src/three';
import math from '../../src/math';

new Grapher3(document.body, [complexScalar(math.gamma, { uRange: [-10, 10], vRange: [-10, 10] })], {}, { xRange: [-10, 10], yRange: [-10, 10] }, { width: 1000, height: 700 });