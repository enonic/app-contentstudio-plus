import { App } from "lib-contentstudio/app/App";
import { AppContainer } from "lib-contentstudio/app/AppContainer";
import { AppId } from "lib-contentstudio/app/AppId";
import {ArchiveAppId} from './ArchiveAppId';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ArchiveAppContainer} from './ArchiveAppContainer';

export class ArchiveApp extends App {

    protected createAppContainer(): AppContainer {
        return new ArchiveAppContainer();
    }

    protected createAppId(): AppId {
        return new ArchiveAppId();
    }

    generateAppUrl(): string {
        return 'main';
    }

    getIconClass(): string {
        return 'icon-archive';
    }

    getIconName(): string {
        return i18n('app.archive');
    }

}