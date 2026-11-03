import {CompareVersionsDialog}
    from '@enonic/lib-contentstudio/v6/widgets/context-panel/widget/versions/compare/CompareVersionsDialog';
import {renderRoot} from '../../../../../shared/renderRoot';
import {ArchiveDeleteDialog} from './ArchiveDeleteDialog';
import {ArchiveRestoreDialog} from './ArchiveRestoreDialog';

export function mountArchiveDialogs(container: HTMLElement): void {
    const host = document.createElement('div');
    container.appendChild(host);

    renderRoot(host, 'archive-dialogs', (
        <>
            <ArchiveDeleteDialog />
            <ArchiveRestoreDialog />
            <CompareVersionsDialog />
        </>
    ));
}
