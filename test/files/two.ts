import { cartesian, Grapher2 } from '../../src/two/grapher';
import math from '../../src/math';

new Grapher2(document.body, [cartesian(x => math.harmonic([x, 0])[0])], { width: 1000, height: 1000 });