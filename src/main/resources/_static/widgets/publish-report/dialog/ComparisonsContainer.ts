import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {ContentVersion} from 'lib-contentstudio/app/ContentVersion';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {ComparisonBlock} from './ComparisonBlock';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ComparisonMode} from './ComparisonMode';

export class ComparisonsContainer
    extends DivEl {

    private static CLASS_NAME: string = 'comparisons-container';

    private filteredPublishedVersions: ContentVersion[];

    private contentId: ContentId;

    private totalPublishedVersions: number = 0;

    constructor() {
        super(ComparisonsContainer.CLASS_NAME);
    }

    setContentId(contentId: ContentId): this {
        this.contentId = contentId;
        return this;
    }

    setTotalPublishedVersions(totalPublishedVersions: number): this {
        this.totalPublishedVersions = totalPublishedVersions;
        return this;
    }

    setFilteredVersions(versions: ContentVersion[]): this {
        this.filteredPublishedVersions = versions;

        if (this.totalPublishedVersions === 0) {
            this.handleNoAnyPublishVersions();
        } else if (versions.length === 0) {
            this.handleNoPublishVersionsWithinPeriod();
        } else if (versions.length === 1) {
            this.handleSinglePublishVersionWithingPeriod();
        } else {
           this.handePublishVersions();
        }

        return this;
    }

    private handleNoAnyPublishVersions(): void {
        this.setModeClass('no-publish-versions');
        this.setHtml(i18n('widget.publishReport.mode.none'));
    }

    private handleNoPublishVersionsWithinPeriod(): void {
        this.setModeClass('no-publish-versions');
        this.setHtml(i18n('widget.publishReport.mode.offline'));
    }

    private handleSinglePublishVersionWithingPeriod(): void {
        this.setModeClass('single-publish-version');
        this.addDisplayEntireContentBlock(this.filteredPublishedVersions[0]);
    }

    private handePublishVersions(): void {
        this.setModeClass('multi-publish-versions');

        this.filteredPublishedVersions.forEach((v1: ContentVersion, index: number) => {
            const v2: ContentVersion = this.filteredPublishedVersions[index + 1];

            if (v2) {
                this.addComparisonBlock(v1, v2);
            }
        });
    }

    private addComparisonBlock(v1: ContentVersion, v2: ContentVersion, mode?: ComparisonMode): void {
        const comparisonBlock: ComparisonBlock = new ComparisonBlock(mode)
            .setContentId(this.contentId)
            .setVersions(v1, v2);

        this.appendChild(comparisonBlock);

        comparisonBlock.load().catch(DefaultErrorHandler.handle);
    }

    private addDisplayEntireContentBlock(version: ContentVersion): void {
        this.addComparisonBlock(version, version, ComparisonMode.DISPLAY_SINGLE);
    }

    private setModeClass(className: string): void {
        this.setClass(`${ComparisonsContainer.CLASS_NAME} ${className}`);
    }
}
