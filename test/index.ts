import { join } from 'path';
import webpack from 'webpack';

webpack([{
    watch: true,
    mode: 'none',
    entry: { app: join(process.cwd(), 'test', 'files', process.argv[2] + '.ts') },
    target: 'web',
    resolve: { extensions: ['.js', '.ts'] },
    module: {
        rules: [{ loader: 'ts-loader', test: /\.tsx?$/, options: { allowTsInNodeModules: true } }],
    },
    output: { filename: '[name].js', path: join(process.cwd(), 'build') },
}], (err, stats) => {
    if (err) throw err;
    console.log(stats!.toString());
});