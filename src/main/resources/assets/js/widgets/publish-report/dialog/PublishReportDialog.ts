import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import * as Q from 'q';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {GetContentVersionsRequest} from 'lib-contentstudio/app/resource/GetContentVersionsRequest';
import {ContentVersions} from 'lib-contentstudio/app/ContentVersions';
import {ContentVersion} from 'lib-contentstudio/app/ContentVersion';
import {ComparisonsContainer} from './ComparisonsContainer';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {GetContentSummaryByIdRequest} from 'lib-contentstudio/app/resource/GetContentSummaryByIdRequest';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {H6El} from '@enonic/lib-admin-ui/dom/H6El';

export class PublishReportDialog
    extends ModalDialog {

    private static INSTANCE: PublishReportDialog;

    private contentId: ContentId;

    private content: ContentSummary;

    private publishedVersions: ContentVersion[];

    private comparisonsContainer: ComparisonsContainer;

    private contentPromise: Q.Promise<ContentSummary>;

    private versionsPromise: Q.Promise<ContentVersions>;

    private fromDate: Date;

    private toDate: Date;

    private subTitleEl: H6El;

    private constructor() {
        super({
            class: 'publish-report-dialog',
            title: i18n('widget.publishReport.dialog.title'),
        });
    }

    static get(): PublishReportDialog {
        if (!PublishReportDialog.INSTANCE) {
            PublishReportDialog.INSTANCE = new PublishReportDialog();
        }

        return PublishReportDialog.INSTANCE;
    }

    setContentId(value: string): PublishReportDialog {
        this.contentId = new ContentId(value);
        return this;
    }

    setFromTo(from: Date, to?: Date): PublishReportDialog {
        this.fromDate = from;
        this.toDate = to ?? new Date();
        return this;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildToContentPanel(this.comparisonsContainer);
            this.appendChildToHeader(this.subTitleEl);

            this.addAction(new Action(i18n('widget.publishReport.dialog.button.print')).onExecuted(() => window.print()));

            this.comparisonsContainer.getEl().setTabIndex(0); // preventing date popups from opening on click on dialog

            return rendered;
        });
    }

    open(): void {
        this.comparisonsContainer.removeChildren();

        super.open();

        this.fetchData().catch(DefaultErrorHandler.handle);

        Body.get().addClass('publish-report-dialog-open');
    }

    close() {
        Body.get().removeClass('publish-report-dialog-open');

        super.close();
    }

    protected initElements(): void {
        super.initElements();

        this.comparisonsContainer = new ComparisonsContainer();
        this.subTitleEl = new H6El('sub-title');
    }

    private fetchData(): Q.Promise<void> {
        this.comparisonsContainer.setContentId(this.contentId);
        this.loadMask.show();

        return Q.all([this.fetchContent(), this.fetchVersions()]).spread((content: ContentSummary, versions: ContentVersions) => {
            this.content = content;

            this.publishedVersions = versions.get().filter((contentVersion: ContentVersion) => {
                const publishInfo = contentVersion.getPublishInfo();
                return publishInfo?.isPublished() && !publishInfo.isScheduled();
            });

            this.comparisonsContainer.setTotalPublishedVersions(this.publishedVersions.length);
            this.comparisonsContainer.removeChildren();
            this.filterVersionsByDateRange();
            this.subTitleEl.setHtml(this.content.getPath().toString());
        }).finally(() => {
            this.loadMask.hide();
        });
    }

    private filterVersionsByDateRange(): void {
        const fromTime = this.fromDate.getTime();
        const toTime = this.toDate.getTime();

        const filteredVersions: ContentVersion[] = this.publishedVersions.filter((contentVersion: ContentVersion) => {
            const versionPublishTime = contentVersion.getPublishInfo().getTimestamp()?.getTime();
            return versionPublishTime &&
                   (fromTime ? versionPublishTime >= fromTime : true) &&
                   (toTime ? versionPublishTime <= toTime : true);
        });

        this.comparisonsContainer.setFilteredVersions(filteredVersions);
    }

    private fetchContent(): Q.Promise<ContentSummary> {
        this.contentPromise = this.contentPromise ?? new GetContentSummaryByIdRequest(this.contentId).sendAndParse();
        return this.contentPromise;
    }

    private fetchVersions(): Q.Promise<ContentVersions> {
        this.versionsPromise = this.versionsPromise ?? new GetContentVersionsRequest(this.contentId).sendAndParse();
        return this.versionsPromise;
    }

}