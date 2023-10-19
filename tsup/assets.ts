import type { Options } from '.';

import esbuildPluginExternalGlobal from 'esbuild-plugin-external-global';
import {
    DIR_DST_ASSETS,
    DIR_SRC_ASSETS
} from './constants';

export default function buildAssetConfig(): Options {
    return {
        bundle: true,
        dts: false, // d.ts files are use useless at runtime
        entry: {
            'js/archive': `${DIR_SRC_ASSETS}/js/archive.ts`,
            'js/main': `${DIR_SRC_ASSETS}/js/main.ts`,
            'js/widgets/layers': `${DIR_SRC_ASSETS}/js/widgets/layers/main.ts`,
            'js/widgets/variants': `${DIR_SRC_ASSETS}/js/widgets/variants/main.ts`,
            'js/widgets/publish-report': `${DIR_SRC_ASSETS}/js/widgets/publish-report/main.ts`,
        },
        esbuildOptions(options, context) {
            options.banner = {
                js: `const jQuery = $;` // jQuery UI Tabbable requires this
            };
        },
        esbuildPlugins: [
            esbuildPluginExternalGlobal.externalGlobalPlugin({
                'jquery': 'window.$'
            })
        ],
        format: [
            'cjs'
        ],
        minify: process.env.NODE_ENV !== 'development',

        // TIP: Command to check if there are any bad requires left behind
        // grep -r 'require("' build/resources/main/assets | grep -v 'require("/'|grep -v chunk
        noExternal: [ // Same as dependencies in package.json
            /@enonic\/lib-admin-ui/,
            'jquery', // This will bundle jQuery into the bundle, unless you use the esbuildPluginExternalGlobal
            'jquery-ui',
            /^lib-contentstudio/,
            'normalize-url',
            'q'
        ],
        outDir: DIR_DST_ASSETS,
        platform: 'browser',
        silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE||''),
        sourcemap: process.env.NODE_ENV === 'development',
        tsconfig: 'src/main/resources/assets/tsconfig.json',
    };
}
