import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Store} from '@enonic/lib-admin-ui/store/Store';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import Q from 'q';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import {GetContentVersionsRequest} from '@enonic/lib-contentstudio/app/resource/GetContentVersionsRequest';
import {GetContentVersionsResult} from '@enonic/lib-contentstudio/app/resource/GetContentVersionsResult';
import {Widget} from '../../Widget';
import {ComparisonsContainer} from './ComparisonsContainer';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummary} from '@enonic/lib-contentstudio/app/content/ContentSummary';
import {GetContentSummaryByIdRequest} from '@enonic/lib-contentstudio/app/resource/GetContentSummaryByIdRequest';
import {H6El} from '@enonic/lib-admin-ui/dom/H6El';
import {ArchiveContentFetcher} from '../../../ArchiveContentFetcher';

export class PublishReportDialog
    extends ModalDialog {

    private contentId: ContentId;

    private content: ContentSummary;

    private isContentArchived: boolean;

    private comparisonsContainer: ComparisonsContainer;

    private contentPromise: Q.Promise<ContentSummary> | Q.Promise<ContentSummaryAndCompareStatus>;

    private versionsPromise: Q.Promise<GetContentVersionsResult>;

    private fromDate: Date;

    private toDate: Date;

    private subTitleEl: H6El;

    private constructor(container: Element) {
        super({
            class: 'publish-report-dialog',
            title: i18n('widget.publishReport.dialog.title'),
            container: container
        });
    }

    static get(hostElement: Element): PublishReportDialog {
        let instance: PublishReportDialog = Store.instance().get(PublishReportDialog.name);
        const container = Widget.getContainer(hostElement);

        if (instance == null) {
            instance = new PublishReportDialog(container);
            Store.instance().set(PublishReportDialog.name, instance);
        } else {
            instance.setContainer(container);
        }

        return instance;
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

    setIsContentArchived(value: boolean): PublishReportDialog {
        this.isContentArchived = value;
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
        this.comparisonsContainer.clean();

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

        return Q.all([this.fetchContent(), this.fetchVersions()]).spread((content: ContentSummary, versions: GetContentVersionsResult) => {
            this.content = content;
            this.comparisonsContainer.clean();
            this.comparisonsContainer.setFromTo(this.fromDate, this.toDate).setAllVersions(versions.getContentVersions());
            this.subTitleEl.setHtml(this.content.getPath().toString());
        }).finally(() => {
            this.loadMask.hide();
        });
    }

    private fetchContent(): Q.Promise<ContentSummary> | Q.Promise<ContentSummaryAndCompareStatus> {
        this.contentPromise = this.contentPromise ??
            (this.isContentArchived ? new ArchiveContentFetcher().fetch(this.contentId) : new GetContentSummaryByIdRequest(this.contentId).sendAndParse());

        return this.contentPromise;
    }

    private fetchVersions(): Q.Promise<GetContentVersionsResult> {
        this.versionsPromise = this.versionsPromise ?? new GetContentVersionsRequest(this.contentId).sendAndParse();
        return this.versionsPromise;
    }

}
