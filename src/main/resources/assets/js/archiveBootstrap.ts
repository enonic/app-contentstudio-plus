import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {AuthContext} from '@enonic/lib-admin-ui/auth/AuthContext';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';
import {resolveConfig} from './util/WidgetConfigResolver';
import {getModuleScript, getRequiredAttribute} from './util/ModuleScriptHelper';

const bootstrapScript = getModuleScript('archive-bootstrap');
const configScriptId = getRequiredAttribute(bootstrapScript, 'data-config-script-id');

CONFIG.setConfig(resolveConfig(configScriptId));
AuthContext.init(
    Principal.fromJson(CONFIG.get('user') as PrincipalJson),
    (CONFIG.get('principals') as PrincipalJson[]).map(Principal.fromJson),
);
