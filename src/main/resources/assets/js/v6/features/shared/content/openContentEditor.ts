import {showWarning} from '@enonic/lib-admin-ui/notify/MessageBus';
import {$config} from '../../../../shared/config';
import {i18n} from '../../../../shared/i18n';

export type OpenContentEditorOptions = {
    displayAsNew?: boolean;
};

    const BLANK_URL = 'about:blank';

export const getEditContentUrl = (projectName: string, contentId: string, options: OpenContentEditorOptions = {}): string => {
    const url = `${$config.get().toolUri}/${projectName}/edit/${contentId}`;
    return options.displayAsNew ? `${url}?displayAsNew=true` : url;
};

// Studio names its editor windows `edit:<project>:<id>`, the widget may run inside one of them.
export function openContentEditor(projectName: string, contentId: string, options: OpenContentEditorOptions = {}): void {
    const tabName = `edit:${projectName}:${contentId}`;

    if (window.name === tabName) {
        window.focus();
        return;
    }

    // An empty URL resolves an existing window by name without navigating it.
    const win = window.open('', tabName);

    if (!win) {
        showWarning(i18n('notify.popupBlocker.admin'), false);
        return;
    }

    if (win.location.href === BLANK_URL) {
        win.location.href = getEditContentUrl(projectName, contentId, options);
    }

    win.focus();
}
