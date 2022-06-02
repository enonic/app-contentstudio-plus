// End of Polyfills
import * as Q from 'q';
import {showError, showWarning} from '@enonic/lib-admin-ui/notify/MessageBus';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {i18nInit, i18nAdd} from '@enonic/lib-admin-ui/util/MessagesInitializer';
import {Router} from 'lib-contentstudio/app/Router';
import {ConnectionDetector} from '@enonic/lib-admin-ui/system/ConnectionDetector';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {Application} from '@enonic/lib-admin-ui/app/Application';
import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import {ApplicationEvent, ApplicationEventType} from '@enonic/lib-admin-ui/application/ApplicationEvent';
import {UriHelper} from '@enonic/lib-admin-ui/util/UriHelper';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Project} from 'lib-contentstudio/app/settings/data/project/Project';
import {ProjectListWithMissingRequest} from 'lib-contentstudio/app/settings/resource/ProjectListWithMissingRequest';
import {ProjectHelper} from 'lib-contentstudio/app/settings/data/project/ProjectHelper';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {ArchiveAppContainer} from './ArchiveAppContainer';
import {Store} from '@enonic/lib-admin-ui/store/Store';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

// Dynamically import and execute all input types, since they are used
// on-demand, when parsing XML schemas and has not real usage in app
declare let require: { context: (directory: string, useSubdirectories: boolean, filter: RegExp) => void };

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const importAll = (r): void => r.keys().forEach(r);
importAll(require.context('lib-contentstudio/app/inputtype', true, /^(?!\.[\\](ui)).*(\.js)$/));

const body = Body.get();

function getApplication(): Application {
    const application = new Application(
        'content-studio-plus',
        i18n('app.name'),
        i18n('app.abbr'),
    );
    application.setPath(Router.getPath());
    application.setWindow(window);
    Store.instance().set('application', application);
    return application;
}

function startLostConnectionDetector(): ConnectionDetector {
    let readonlyMessageId: string;

    const connectionDetector: ConnectionDetector =
        ConnectionDetector.get()
            .setAuthenticated(true)
            .setSessionExpireRedirectUrl(CONFIG.getString('toolUri'))
            .setNotificationMessage(i18n('notify.connection.loss'));

    connectionDetector.onReadonlyStatusChanged((readonly: boolean) => {
        if (readonly && !readonlyMessageId) {
            readonlyMessageId = showWarning(i18n('notify.repo.readonly'), false);
        } else if (readonlyMessageId) {
            NotifyManager.get().hide(readonlyMessageId);
            readonlyMessageId = null;
        }
    });

    connectionDetector.startPolling(true);

    return connectionDetector;
}

function initApplicationEventListener(): void {

    let messageId;
    let appStatusCheckInterval;

    ApplicationEvent.on((event: ApplicationEvent) => {
        if (ApplicationEventType.STOPPED === event.getEventType() ||
            ApplicationEventType.UNINSTALLED === event.getEventType()) {
            if (appStatusCheckInterval) {
                return;
            }
            appStatusCheckInterval = setInterval(() => {
                if (!messageId && CONFIG.getString('appId') === event.getApplicationKey().toString()) {
                    NotifyManager.get().hide(messageId);
                    messageId = showError(i18n('notify.application.notAvailable'), false);
                }
            }, 1000);
        }
        if (ApplicationEventType.STARTED === event.getEventType() || ApplicationEventType.INSTALLED) {
            if (messageId) {
                NotifyManager.get().hide(messageId);
                messageId = null;
            }
            clearInterval(appStatusCheckInterval);
        }
    });
}

function initProjectContext(application: Application): Q.Promise<void> {
    return new ProjectListWithMissingRequest().sendAndParse().then((projects: Project[]) => {
        const projectName: string = application.getPath().getElement(0);

        if (projectName) {
            const currentProject: Project =
                projects.find((project: Project) => ProjectHelper.isAvailable(project) && project.getName() === projectName);

            if (currentProject) {
                ProjectContext.get().setProject(currentProject);
                return Q();
            }
        }

        if (ProjectHelper.isAvailable(projects[0])) {
            ProjectContext.get().setProject(projects[0]);
            return Q();
        }

        return Q();
    });
}

function startApplication(): void {
    const application: Application = getApplication();
    const connectionDetector = startLostConnectionDetector();

    initApplicationEventListener();

    initProjectContext(application)
        .catch((reason: any) => {
            DefaultErrorHandler.handle(reason);
            NotifyManager.get().showWarning(i18n('notify.settings.project.initFailed'));
        })
        .finally(() => {
            startContentBrowser(application);
        });

    application.setLoaded(true);
}

function startContentBrowser(application: Application): void {
    const archiveAppContainer = new ArchiveAppContainer();
    body.appendChild(archiveAppContainer);
    archiveAppContainer.show();
}

void (async () => {
    if (!document.currentScript) {
        throw 'Legacy browsers are not supported';
    }
    const configServiceUrl = document.currentScript.getAttribute('data-config-service-url');
    if (!configServiceUrl) {
        throw 'Missing \'data-config-service-url\' attribute';
    }

    await CONFIG.init(configServiceUrl);
    await i18nInit(CONFIG.getString('services.i18nUrlStudio'));
    await i18nAdd(CONFIG.getString('services.i18nUrl'));

    const renderListener = (): void => {
        startApplication();
        body.unRendered(renderListener);
    };
    if (body.isRendered()) {
        renderListener();
    } else {
        body.onRendered(renderListener);
    }
})();
