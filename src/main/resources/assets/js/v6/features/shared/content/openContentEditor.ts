import {showWarning} from '@enonic/lib-admin-ui/notify/MessageBus';
import {$config} from '../../../../shared/config';
import {i18n} from '../../../../shared/i18n';

const openTabs = new Map<string, Window>();

export const getEditContentUrl = (projectName: string, contentId: string): string =>
    `${$config.get().toolUri}/${projectName}/edit/${contentId}`;

export function openContentEditor(projectName: string, contentId: string): void {
    const tabName = `edit:${projectName}:${contentId}`;
    const existing = openTabs.get(tabName);

    if (existing && !existing.closed) {
        existing.focus();
        return;
    }

    const win = window.open(getEditContentUrl(projectName, contentId), tabName);

    if (!win) {
        showWarning(i18n('notify.popupBlocker.admin'), false);
        return;
    }

    openTabs.set(tabName, win);
}
