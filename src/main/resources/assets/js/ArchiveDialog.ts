import {ModalDialog, ModalDialogConfig} from 'lib-admin-ui/ui/dialog/ModalDialog';
import {ConfirmValueDialog} from 'lib-contentstudio/app/remove/ConfirmValueDialog';
import {ArchiveBundleViewItem} from './ArchiveBundleViewItem';
import {ArchiveBundleViewer} from './ArchiveBundleViewer';
import {H6El} from 'lib-admin-ui/dom/H6El';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {Action} from 'lib-admin-ui/ui/Action';
import {GetDescendantsOfContentsRequest} from 'lib-contentstudio/app/resource/GetDescendantsOfContentsRequest';
import {ArchiveItemsList} from './ArchiveItemsList';

export abstract class ArchiveDialog extends ModalDialog {

    protected confirmValueDialog: ConfirmValueDialog;

    protected archiveBundle: ArchiveBundleViewItem;

    protected archiveBundleViewer: ArchiveBundleViewer;

    protected itemsList: ArchiveItemsList;

    protected archiveAction: Action;

    protected constructor(config: ModalDialogConfig = <ModalDialogConfig>{}) {
        super(config);
    }

    protected initElements(): void {
        super.initElements();

        this.confirmValueDialog = new ConfirmValueDialog();
        this.confirmValueDialog
            .setHeaderText(this.getConfirmValueDialogTitle())
            .setSubheaderText(this.getConfirmValueDialogSubTitle())
            .setYesCallback(this.executeAction.bind(this));

        this.archiveBundleViewer = new ArchiveBundleViewer();
        this.itemsList = new ArchiveItemsList();
        this.archiveAction = new Action(this.getArchiveActionTitle());
    }

    protected postInitElements(): void {
        super.postInitElements();

        this.addAction(this.archiveAction, true);
        this.addCancelButtonToBottom();
    }

    protected initListeners(): void {
        super.initListeners();

        this.archiveAction.onExecuted(() => {
            this.confirmValueDialog.setValueToCheck('' + this.itemsList.getItemCount()).open();
        });

        this.itemsList.onItemsAdded(() => {
            if (this.isClosed()) {
                return;
            }

            this.resizeHandler(); // to toggle fullscreen mode if needed
        });
    }

    protected executeAction() {
        this.doAction();
        this.close();
    }

    protected abstract doAction();

    setArchiveBundle(archive: ArchiveBundleViewItem): ArchiveDialog {
        this.archiveBundle = archive;
        this.archiveBundleViewer.setObject(archive);

        new GetDescendantsOfContentsRequest(archive.getData().getPath()).sendAndParse().then((ids: ContentId[]) => {
            this.itemsList.setItemsIds(ids);
            this.archiveAction.setLabel(`${this.getArchiveActionTitle()} (${ids.length})`);
        });

        return this;
    }

    close(): void {
        super.close();
        this.itemsList.clearItems();
    }

    protected abstract getSubtitle(): string;

    protected abstract getItemsSubtitle(): string;

    protected abstract getArchiveActionTitle(): string;

    protected abstract getConfirmValueDialogTitle(): string;

    protected abstract getConfirmValueDialogSubTitle(): string;

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-dialog');

            this.appendChildToHeader( new H6El('sub-title').setHtml(this.getSubtitle()));
            this.appendChildToContentPanel(this.archiveBundleViewer);
            this.appendChildToContentPanel(new H6El('items-title').setHtml(this.getItemsSubtitle()));
            this.appendChildToContentPanel(this.itemsList);

            return rendered;
        });
    }
}
