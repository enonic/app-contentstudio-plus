import {ModalDialog, ModalDialogConfig} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {ConfirmValueDialog} from 'lib-contentstudio/app/remove/ConfirmValueDialog';
import {H6El} from '@enonic/lib-admin-ui/dom/H6El';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {GetDescendantsOfContentsRequest} from 'lib-contentstudio/app/resource/GetDescendantsOfContentsRequest';
import {ArchiveItemsList} from './ArchiveItemsList';
import {ArchiveDialogItemList} from './ArchiveDialogItemList';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';

export abstract class ArchiveDialog
    extends ModalDialog {

    protected confirmValueDialog: ConfirmValueDialog;

    protected items: ArchiveContentViewItem[];

    protected archiveItemViewers: ArchiveDialogItemList;

    protected itemsList: ArchiveItemsList;

    protected itemsTitleEl: H6El;

    protected archiveAction: Action;

    protected totalToProcess: number;

    protected constructor(config: ModalDialogConfig = {} as ModalDialogConfig) {
        super(config);
    }

    setItems(items: ArchiveContentViewItem[]): ArchiveDialog {
        this.items = items;
        this.archiveItemViewers.setItems(items);

        void new GetDescendantsOfContentsRequest()
            .setContentPaths(items.map((item: ArchiveContentViewItem) => item.getContentSummary().getPath()))
            .setContentRootPath(ArchiveResourceRequest.ARCHIVE_PATH)
            .sendAndParse()
            .then((ids: ContentId[]) => {
                this.itemsList.setItemsIds(ids);
                this.itemsList.setVisible(ids.length > 0);
                this.itemsTitleEl.setVisible(ids.length > 0);

                this.totalToProcess = this.items.length + ids.length;
                this.confirmValueDialog.setValueToCheck(`${this.totalToProcess}`);
                this.archiveAction.setLabel(this.getArchiveActionTitle() + (this.totalToProcess > 1 ? ` (${this.totalToProcess})` : ''));
            });

        return this;
    }

    close(): void {
        super.close();
        this.itemsList.clearItems();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-dialog');

            this.appendChildToHeader(new H6El('sub-title').setHtml(this.getSubtitle()));
            this.appendChildToContentPanel(this.archiveItemViewers);
            this.appendChildToContentPanel(this.itemsTitleEl.setHtml(this.getItemsSubtitle()));
            this.appendChildToContentPanel(this.itemsList);

            return rendered;
        });
    }

    protected initElements(): void {
        super.initElements();

        this.confirmValueDialog = new ConfirmValueDialog();
        this.confirmValueDialog
            .setHeaderText(this.getConfirmValueDialogTitle())
            .setSubheaderText(this.getConfirmValueDialogSubTitle())
            .setYesCallback(() => this.executeAction())
            .setNoCallback(() => this.close());

        this.archiveItemViewers = new ArchiveDialogItemList();
        this.itemsList = new ArchiveItemsList();
        this.itemsTitleEl = new H6El('items-title');
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
            if (this.isConfirmDialogRequired()) {
                this.confirmValueDialog.open();
            } else {
                this.executeAction();
            }
        });

        this.itemsList.onItemsAdded(() => {
            if (this.isClosed()) {
                return;
            }

            this.resizeHandler(); // to toggle fullscreen mode if needed
        });
    }

    protected isConfirmDialogRequired(): boolean {
        return this.items.length + this.itemsList.getItemCount() > 1;
    }

    protected executeAction(): void {
        this.doAction();
        this.close();
    }

    protected abstract doAction();

    protected abstract getSubtitle(): string;

    protected abstract getItemsSubtitle(): string;

    protected abstract getArchiveActionTitle(): string;

    protected abstract getConfirmValueDialogTitle(): string;

    protected abstract getConfirmValueDialogSubTitle(): string;
}
