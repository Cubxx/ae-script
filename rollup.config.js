import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { globSync } from 'glob';
import { fileURLToPath } from 'node:url';
import path from 'path';

/**@type {import('rollup').RollupOptions} */
export default {
    input: Object.fromEntries(
        globSync('src/*.tsx').map((file) => [
            path.relative(
                'src',
                file.slice(0, file.length - path.extname(file).length),
            ),
            fileURLToPath(new URL(file, import.meta.url)),
        ]),
    ),
    output: [
        {
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
                        braces: true,
                        comments: false,
                        preamble: `// Cubxx shawn6304@qq.com ${new Date().toLocaleString()}`,
                    },
                }),
            ],
        },
    ],
    plugins: [resolve(), typescript()],
};
