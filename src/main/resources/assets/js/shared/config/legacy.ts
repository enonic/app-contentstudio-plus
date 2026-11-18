import {AuthContext} from '@enonic/lib-admin-ui/auth/AuthContext';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import type {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';
import {CONFIG, type ConfigObject} from '@enonic/lib-admin-ui/util/Config';
import {initConfig as initStudioConfig} from '@enonic/lib-contentstudio/v6/shared/config/config.store';
import {readStudioUrls} from '../events/studioSocket';
import {readConfigScript} from './config';

// The bundled lib-admin-ui and lib-contentstudio classes read their own config and auth stores.
export function initLegacyConfig(scriptId: string): void {
    const raw = readConfigScript(scriptId);
    const studioUrls = readStudioUrls();
    // ! The bundled Content Studio task tracking opens the events socket and throws without these two.
    const socketConfig = studioUrls && {
        sharedSocketUrl: studioUrls.sharedSocketUrl,
        services: {...(raw.services as ConfigObject), eventsUrl: studioUrls.eventsUrl},
    };
    CONFIG.setConfig({...raw, ...socketConfig} as ConfigObject);
    initStudioConfig(scriptId);
    AuthContext.init(
        Principal.fromJson(raw.user as PrincipalJson),
        ((raw.principals ?? []) as PrincipalJson[]).map(Principal.fromJson),
    );
}
