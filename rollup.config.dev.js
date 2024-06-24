import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { globSync } from 'glob';
import { fileURLToPath } from 'node:url';
import path from 'path';

// const files = Object.fromEntries(
//     globSync('src/*.ui.tsx').map((file) => [
//         path.relative(
//             'src',
//             file.slice(0, file.length - path.extname(file).length),
//         ),
//         fileURLToPath(new URL(file, import.meta.url)),
//     ]),
// );
/**@type {import('rollup').RollupOptions} */
export default {
    input: 'src/toolbox.ui.tsx',
    output: {
        dir: 'dist',
        entryFileNames: '[name].jsx',
        intro: '(function () {',
        outro: '}).call(this);',
        sourcemap: true,
        plugins: [
            terser({
                compress: false,
                mangle: false,
                sourceMap: true,
                format: {
                    beautify: true,
                    comments: false,
                    keep_quoted_props: true,
                    keep_numbers: true,
                    wrap_func_args: false,
                },
            }),
        ],
    },
    treeshake: {
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
    },
    plugins: [resolve(), typescript()],
    context: 'this',
};
