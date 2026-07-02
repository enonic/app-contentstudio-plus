import inject from '@rollup/plugin-inject';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import {cpSync, existsSync} from 'fs';
import path from 'path';
import postcssNormalize from 'postcss-normalize';
import postcssSortMediaQueries from 'postcss-sort-media-queries';
import {fileURLToPath} from 'url';
import {defineConfig, type Plugin, type UserConfig} from 'vite';

const copyFlagIcons = (sourceRoot: string, outDir: string): Plugin => ({
  name: 'copy-flag-icons',
  apply: 'build',
  closeBundle() {
    const flagsSrc = path.join(sourceRoot, 'node_modules/flag-icons/flags');
    if (!existsSync(flagsSrc)) return;
    cpSync(flagsSrc, path.join(outDir, 'styles/flags'), {recursive: true});
  },
});

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
          onwarn(warning, warn) {
            // Suppress INVALID_ANNOTATION warnings from @enonic/ui's prebuilt bundle
            if (warning.code === 'INVALID_ANNOTATION' && warning.id?.includes('@enonic/ui')) {
              return;
            }
            warn(warning);
          },
          plugins: [
            inject({
              $: 'jquery',
              jQuery: 'jquery',
            }),
          ],
          input: {
            'js/archive-bootstrap': path.join(IN_PATH, 'js/archiveBootstrap.ts'),
            'js/archive': path.join(IN_PATH, 'js/archive.ts'),
            'js/extension/layers': path.join(IN_PATH, 'js/extension/layers/main.ts'),
            'js/extension/variants': path.join(IN_PATH, 'js/extension/variants/main.ts'),
            'js/extension/publish-report': path.join(IN_PATH, 'js/extension/publish-report/main.ts'),
          },
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
          external: []
        }
      },
      esbuild: {
        minifyIdentifiers: false,
        keepNames: true,
        treeShaking: true,
        jsx: 'automatic',
        jsxImportSource: 'preact',
        jsxDev: isDevelopment,
        ...(isProduction && {
          drop: ['console', 'debugger'],
          legalComments: 'none'
        })
      },
      resolve: {
        alias: {
          '@enonic/lib-admin-ui': path.join(__dirname, '.xp/dev/lib-admin-ui'),
          '@enonic/lib-contentstudio': path.join(__dirname, '.xp/dev/lib-contentstudio'),
          react: 'preact/compat',
          'react-dom': 'preact/compat',
          'react/jsx-runtime': 'preact/jsx-runtime',
          'react/jsx-dev-runtime': 'preact/jsx-dev-runtime'
        },
        dedupe: ['@enonic/ui', 'preact', 'preact/compat', '@radix-ui/react-slot', 'focus-trap-react', 'react-virtuoso', '@nanostores/preact', 'nanostores'],
        extensions: ['.tsx', '.ts', '.jsx', '.js']
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
      plugins: [copyFlagIcons(__dirname, OUT_PATH)],
      build: {
        outDir: OUT_PATH,
        emptyOutDir: false,
        minify: isProduction,
        sourcemap: isDevelopment,
        rollupOptions: {
          input: {
            'styles/main': path.join(IN_PATH, 'styles/main.less'),
            'styles/extension/layers': path.join(IN_PATH, 'styles/extension/layers/main.less'),
            'styles/extension/variants': path.join(IN_PATH, 'styles/extension/variants/main.less'),
            'styles/extension/publish-report': path.join(IN_PATH, 'styles/extension/publish-report/main.less'),
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
        alias: {
          '~enonic-admin-artifacts': 'enonic-admin-artifacts/index.less'
        },
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
            tailwindcss({base: __dirname}),
            postcssNormalize(),
            autoprefixer(),
            postcssSortMediaQueries({sort: 'desktop-first'}),
            ...(isProduction ? [cssnano({preset: ['default', {normalizeUrl: false}]})] : [])
          ]
        }
      }
    }
  };

  return CONFIGS[target];
});
