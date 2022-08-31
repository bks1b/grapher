import { Intersection, Object3D } from 'three';
import GraphConfig from '../GraphConfig';
import Grapher from './lib/Grapher';
import { Fns, PointData } from './types';

export default abstract class<K extends keyof Fns, V = number[]> extends GraphConfig<Grapher, K, V> {
    public raycast!: Object3D;
    abstract graph(): void;
    abstract getPoint(inter: Intersection): PointData | undefined;
}