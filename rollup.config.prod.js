import config from './rollup.config.dev.js';
import terser from '@rollup/plugin-terser';

/**@type {import('rollup').RollupOptions} */
export default {
    ...config,
    output: {
        dir: 'dist',
        entryFileNames: '[name].min.jsx',
        intro: '(function () {',
        outro: '}).call(this);',
        plugins: [
            terser({
                compress: {
                    arrows: false,
                    arguments: true,
                    booleans: true,
                    conditionals: false,
                    evaluate: false,
                    join_vars: false,
                    keep_infinity: true,
                    sequences: false,
                    toplevel: true,
                },
                format: {
                    preamble: `// Cubxx shawn6304@qq.com ${new Date().toLocaleString()}`,
                },
            }),
        ],
    },
};
