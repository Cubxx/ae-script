import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dotenv from 'dotenv';

dotenv.config();
/**
 * @type {import('rollup').RollupOptions}
 * @link https://www.rollupjs.com/configuration-options
 */
export default {
    input: `src/${process.env.SCRIPT_NAME}.tsx`,
    output:
        process.env.NODE_ENV === 'prod'
            ? {
                  dir: 'dist',
                  entryFileNames: '[name].min.jsx',
                  intro: '(function(){',
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
                              preamble: `// Cubx https://github.com/Cubxx/ae-script ${new Date().toLocaleString()}`,
                          },
                      }),
                  ],
              }
            : {
                  dir: 'dist',
                  entryFileNames: '[name].jsx',
                  intro: '(function(){',
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
