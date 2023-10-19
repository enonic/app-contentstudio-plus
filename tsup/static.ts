import type { Options } from '.';


import CopyWithHashPlugin from '@enonic/esbuild-plugin-copy-with-hash';
import TsupPluginManifest from '@enonic/tsup-plugin-manifest';
import esbuildPluginExternalGlobal from 'esbuild-plugin-external-global';
import {
    DIR_DST_STATIC,
    DIR_SRC_STATIC
} from './constants';

export default function buildStaticConfig(): Options {
    return {
        bundle: true,
        dts: false,
        entry: {
            'archive': `${DIR_SRC_STATIC}/archive.ts`,
            'main': `${DIR_SRC_STATIC}/main.ts`,
            'widgets/layers': `${DIR_SRC_STATIC}/widgets/layers/main.ts`,
            'widgets/variants': `${DIR_SRC_STATIC}/widgets/variants/main.ts`,
            'widgets/publish-report': `${DIR_SRC_STATIC}/widgets/publish-report/main.ts`,
        },
        esbuildOptions(options, context) {
            // options.banner = {
            //     js: `const jQuery = $;` // jQuery UI Tabbable requires this
            // };
            options.keepNames = true;
            // options.outbase = DIR_SRC_STATIC;
        },
        esbuildPlugins: [
            esbuildPluginExternalGlobal.externalGlobalPlugin({
                'jquery': 'window.$'
            }),
            CopyWithHashPlugin({
                context: 'node_modules',
                manifest: `node_modules-manifest.json`,
                patterns: [
                    'jquery/dist/*.*',
                    'jquery-ui-dist/*.*',
                ]
            }),
            TsupPluginManifest({
                generate: (entries) => {// Executed once per format
                    const newEntries = {};
                    Object.entries(entries).forEach(([k,v]) => {
                        console.log(k,v);
                        const ext = v.split('.').pop() as string;
                        const parts = k.replace(`${DIR_SRC_STATIC}/`, '').split('.');
                        parts.pop();
                        parts.push(ext);
                        newEntries[parts.join('.')] = v.replace(`${DIR_DST_STATIC}/`, '');
                    });
                    return newEntries;
                }
            }),
        ],
        format: [
            'cjs'
        ],
        minify: process.env.NODE_ENV !== 'development',
        
        // TIP: Command to check if there are any bad requires left behind
        // grep -r 'require("' build/resources/main/_static | grep -v 'require("/'|grep -v chunk
        noExternal: [ // Same as dependencies in package.json
            /@enonic\/lib-admin-ui/,
            'jquery', // This will bundle jQuery into the bundle, unless you use the esbuildPluginExternalGlobal
            'jquery-ui',
            /^lib-contentstudio/,
            'normalize-url',
            'q'
        ],
        outDir: DIR_DST_STATIC,
        platform: 'browser',
        silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE||''),
        sourcemap: process.env.NODE_ENV === 'development',
        splitting: false,

        // INFO: Sourcemaps works when target is set here, rather than in tsconfig.json
        // target: 'es5', // lib-admin-ui uses slickgrid which requires this?
        target: 'es2020',

        tsconfig: `${DIR_SRC_STATIC}/tsconfig.json`,
    };
}