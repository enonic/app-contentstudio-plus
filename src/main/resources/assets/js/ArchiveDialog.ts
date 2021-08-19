import {i18n} from 'lib-admin-ui/util/Messages';
import {ModalDialog, ModalDialogConfig} from 'lib-admin-ui/ui/dialog/ModalDialog';
import {ConfirmValueDialog} from 'lib-contentstudio/app/remove/ConfirmValueDialog';
import {ArchiveBundleViewItem} from './ArchiveBundleViewItem';
import {ArchiveBundleViewer} from './ArchiveBundleViewer';
import {H6El} from 'lib-admin-ui/dom/H6El';
import {ListBox} from 'lib-admin-ui/ui/selector/list/ListBox';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusViewer} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatusViewer';
import {ArchiveContentViewItemBuilder} from './ArchiveContentViewItem';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {ContentResponse} from 'lib-contentstudio/app/resource/ContentResponse';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {Action} from 'lib-admin-ui/ui/Action';
import {ArchiveContentViewer} from './ArchiveContentViewer';
import {ArchiveContentDialogViewer} from './ArchiveContentDialogViewer';
import {GetDescendantsOfContentsRequest} from 'lib-contentstudio/app/resource/GetDescendantsOfContentsRequest';

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
            ContentSummaryAndCompareStatusFetcher.fetchByIds(ids).then((items: ContentSummaryAndCompareStatus[]) => {
                this.itemsList.setItems(items);
                this.archiveAction.setLabel(`${this.getArchiveActionTitle()} (${items.length})`);
            }).catch(DefaultErrorHandler.handle);
        });

        return this;
    }

    private loadArchivedBundleContents(): Q.Promise<ContentSummaryAndCompareStatus[]> {
        return ContentSummaryAndCompareStatusFetcher.fetchChildren(new ContentId(this.archiveBundle.getId())).then(
            (response: ContentResponse<ContentSummaryAndCompareStatus>) => response.getContents());
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

export class ArchiveItemsList extends ListBox<ContentSummaryAndCompareStatus> {

    constructor() {
        super('archive-items-list');
    }

    protected createItemView(item: ContentSummaryAndCompareStatus, readOnly: boolean): ArchiveContentDialogViewer {
        const viewer: ArchiveContentDialogViewer = new ArchiveContentDialogViewer();

        viewer.setObject(item);

        return viewer;
    }

    protected getItemId(item: ContentSummaryAndCompareStatus): string {
        return item.getId();
    }
}
