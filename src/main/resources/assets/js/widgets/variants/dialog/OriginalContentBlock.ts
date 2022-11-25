import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {H6El} from '@enonic/lib-admin-ui/dom/H6El';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusViewer} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatusViewer';
import {ContentWindowHelper} from './ContentWindowHelper';
import * as Q from 'q';

export class OriginalContentBlock extends DivEl {

    private originalContent: ContentSummaryAndCompareStatus;

    private originalContentViewer: ContentSummaryAndCompareStatusViewer;

    constructor() {
        super('original-item-container');

        this.initElements();
        this.initListeners();
    }

    private initElements(): void {
        this.originalContentViewer = new ContentSummaryAndCompareStatusViewer();
    }

    private initListeners(): void {
        this.originalContentViewer.onClicked(this.openContentForEdit.bind(this));
    }

    private openContentForEdit(): void {
        new ContentWindowHelper(this.originalContent.getId()).openEditWizard();
    }

    setContent(content: ContentSummaryAndCompareStatus): void {
        this.originalContent = content;
        this.originalContentViewer.setObject(content);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(new H6El('original-item-container-title').setHtml(i18n('widget.variants.dialog.create.original')));
            this.appendChild(this.originalContentViewer);

            return rendered;
        });
    }
}