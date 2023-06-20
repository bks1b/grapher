import { cartesian, Grapher2 } from '../../src/two/grapher';
import math from '../../src/math';

const grapher = new Grapher2(document.getElementById('container')!, [cartesian(x => math.harmonic([x, 0])[0])]);
window.onresize = () => grapher.resize();