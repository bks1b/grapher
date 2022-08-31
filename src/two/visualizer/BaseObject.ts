import { Coord } from '../../types';
import Scene from './Scene';

export default class {
    public points: Coord[] = [];
    constructor(protected scene: Scene) {
        scene.objects.push(this);
    }
}