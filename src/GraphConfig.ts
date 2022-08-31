import { BaseGrapher, OptionalConfig } from './types';
import { assignConfig } from './util';

export default class<Grapher extends BaseGrapher<K>, K extends keyof Grapher['config']['fns'], V = number[], I extends any[] = number[]> {
    protected config: Grapher['config']['fns'][K];
    constructor(
        protected grapher: Grapher,
        protected fn: (...args: I) => V,
        config: OptionalConfig<Grapher['config']['fns'][K]> = <OptionalConfig<Grapher['config']['fns'][K]>>{},
    ) {
        this.config = assignConfig<Grapher['config']['fns'][K]>(<OptionalConfig<Grapher['config']['fns'][K]>>grapher.config.fns[(<{ key: K; }><unknown>this.constructor).key], config);
        this.init?.();
    }

    init?(): void;
}