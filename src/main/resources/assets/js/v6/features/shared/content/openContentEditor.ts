import {showWarning} from '@enonic/lib-admin-ui/notify/MessageBus';
import {$config} from '../../../../shared/config';
import {i18n} from '../../../../shared/i18n';

export type OpenContentEditorOptions = {
    displayAsNew?: boolean;
};

const openTabs = new Map<string, Window>();

export const getEditContentUrl = (projectName: string, contentId: string, options: OpenContentEditorOptions = {}): string => {
    const url = `${$config.get().toolUri}/${projectName}/edit/${contentId}`;
    return options.displayAsNew ? `${url}?displayAsNew=true` : url;
};

export function openContentEditor(projectName: string, contentId: string, options: OpenContentEditorOptions = {}): void {
    const tabName = `edit:${projectName}:${contentId}`;
    const existing = openTabs.get(tabName);

    if (existing && !existing.closed) {
        existing.focus();
        return;
    }

    const win = window.open(getEditContentUrl(projectName, contentId, options), tabName);

    if (!win) {
        showWarning(i18n('notify.popupBlocker.admin'), false);
        return;
    }

    openTabs.set(tabName, win);
}
