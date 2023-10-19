import type {Request, Response} from '/types/';

// @ts-expect-error No types for /lib/mustache yet.
import {render} from '/lib/mustache';
import {getLauncherPath, getLocales} from '/lib/xp/admin';
import {assetUrl, serviceUrl} from '/lib/xp/portal';
import {localize} from '/lib/xp/i18n';
// @ts-expect-error Cannot find module '/lib/router' or its corresponding type declarations.ts(2307)
import newRouter from '/lib/router';
import {immutableGetter, getAdminUrl} from '/lib/app-contentstudio-plus/urlHelper';
import {
	FILEPATH_MANIFEST_NODE_MODULES,
	GETTER_ROOT,
} from '/constants';


const VIEW = resolve('./main.html');
const TOOL_NAME = 'main';

const router = newRouter();

function get(_r: Request): Response {
    const params = {
        appName: localize({
            key: 'app.archive',
            bundles: ['i18n/phrases'],
            locale: getLocales()
        }),
        appId: app.name,
        assetsUri: assetUrl({
            path: ''
        }),
        jqueryUrl: getAdminUrl({
            manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
            path: 'jquery/dist/jquery.min.js',
        }, TOOL_NAME),
        jqueryUiUrl: getAdminUrl({
            manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
            path: 'jquery-ui-dist/jquery-ui.min.js',
        }, TOOL_NAME),
        mainBundleUrl: getAdminUrl({
            path: 'main.js'
        }, TOOL_NAME),
        studioAssetsUri: assetUrl({
            path: '',
            application: 'com.enonic.app.contentstudio'
        }),
        configServiceUrl: serviceUrl({service: 'config'}),
        launcherPath: getLauncherPath()
    };
    // log.debug('params:%s', JSON.stringify(params, null, 4));

    return {
        contentType: 'text/html',
        body: render(VIEW, params)
    };
}

router.get('/?', (r: Request) => get(r));

// Adding these lines makes XP respond with 404
router.all(`/${GETTER_ROOT}/{path:.+}`, (r: Request) => {
    // log.info('static request:%s', JSON.stringify(r, null, 4));
    return immutableGetter(r);
});

export const all = (r: Request) => router.dispatch(r);