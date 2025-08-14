import inject from '@rollup/plugin-inject';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import path from 'path';
import postcssNormalize from 'postcss-normalize';
import postcssSortMediaQueries from 'postcss-sort-media-queries';
import {fileURLToPath} from 'url';
import {defineConfig, type UserConfig} from 'vite';

const allowedTargets = ['js', 'css'] as const;
type BuildTarget = (typeof allowedTargets)[number];

const isBuildTarget = (target: string | undefined): target is BuildTarget => {
  return allowedTargets.includes(target as BuildTarget);
};

const __dirname = path.dirname(fileURLToPath(import.meta.url)) ?? '';

export default defineConfig(({mode}) => {
  const {BUILD_TARGET} = process.env;
  const target = isBuildTarget(BUILD_TARGET) ? BUILD_TARGET : 'js';

  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  const IN_PATH = path.join(__dirname, 'src/main/resources/assets');
  const OUT_PATH = path.join(__dirname, 'build/resources/main/assets');

  const CONFIGS: Record<BuildTarget, UserConfig> = {
    js: {
      root: IN_PATH,
      base: './',

      build: {
        outDir: OUT_PATH,
        emptyOutDir: false,
        target: 'ES2023',
        minify: isProduction,
        sourcemap: isDevelopment ? true : false,
        ...(isProduction && {
          reportCompressedSize: true,
          chunkSizeWarningLimit: 1000
        }),
        rollupOptions: {
          input: {
            'js/archive': path.join(IN_PATH, 'js/archive.ts'),
            'js/widgets/layers': path.join(IN_PATH, 'js/widgets/layers/main.ts'),
            'js/widgets/variants': path.join(IN_PATH, 'js/widgets/variants/main.ts'),
            'js/widgets/publish-report': path.join(IN_PATH, 'js/widgets/publish-report/main.ts'),
          },
          plugins: [
            inject({
              $: 'jquery',
              jQuery: 'jquery',
              'window.jQuery': 'jquery',
            }),
          ],
          output: {
            format: 'es',
            entryFileNames: '[name].js',
            chunkFileNames: 'js/chunks/[name]-[hash].js',
            assetFileNames: '[name][extname]',
            ...(isProduction && {
              compact: true,
              generatedCode: {
                constBindings: true
              }
            })
          },
          external: [
            'jquery',
            // 'jquery-simulate/jquery.simulate.js',
            'jquery-ui',
            'jquery-ui/ui/tabbable',
            'jquery-ui/ui/widget',
            'jquery-ui/ui/widgets/mouse',
            'jquery-ui/ui/widgets/sortable',
            'q',
            // 'jsondiffpatch',
            // 'dompurify',
            // 'mousetrap',
          ]
        }
      },
      esbuild: {
        minifyIdentifiers: false,
        keepNames: true,
        treeShaking: true,
        ...(isProduction && {
          drop: ['console', 'debugger'],
          legalComments: 'none'
        })
      },
      resolve: {
        alias: {
          '@enonic/lib-admin-ui': path.join(__dirname, '.xp/dev/lib-admin-ui'),
          'lib-contentstudio': path.join(__dirname, '.xp/dev/lib-contentstudio'),
        },
        extensions: ['.ts', '.js']
      },
      ...(isDevelopment && {
        server: {
          open: false,
          hmr: true
        },
        clearScreen: false
      }),
      ...(isProduction && {
        logLevel: 'warn'
      })
    },
    css: {
      root: IN_PATH,
      base: './',
      build: {
        outDir: OUT_PATH,
        emptyOutDir: false,
        minify: isProduction,
        sourcemap: isDevelopment,
        rollupOptions: {
          input: {
            'styles/main': path.join(IN_PATH, 'styles/main.less'),
            'styles/widgets/layers': path.join(IN_PATH, 'styles/widgets/layers/main.less'),
            'styles/widgets/variants': path.join(IN_PATH, 'styles/widgets/variants/main.less'),
            'styles/widgets/publish-report': path.join(IN_PATH, 'styles/widgets/publish-report/main.less'),
            'styles/license': path.join(IN_PATH, 'styles/license.less'),
          },
          output: {
            assetFileNames: (assetInfo) => {
              const assetName = assetInfo.names?.[0] ?? '';
              if (assetName.endsWith('.css')) {
                const name = assetName.replace(/\.(less|css)$/, '');
                return `${name}.css`;
              }
              if (/\.(svg|png|jpg|gif)$/.test(assetName)) {
                return 'images/[name][extname]';
              }
              if (/\.(woff|woff2|ttf|eot)$/.test(assetName)) {
                return 'fonts/[name][extname]';
              }
              return '[name][extname]';
            }
          }
        }
      },
      resolve: {
        extensions: ['.less', '.css']
      },
      css: {
        preprocessorOptions: {
          less: {
            javascriptEnabled: true
          }
        },
        postcss: {
          plugins: [
            postcssNormalize(),
            autoprefixer(),
            postcssSortMediaQueries({sort: 'desktop-first'}),
            ...(isProduction ? [cssnano()] : [])
          ]
        }
      }
    }
  };

  return CONFIGS[target];
});