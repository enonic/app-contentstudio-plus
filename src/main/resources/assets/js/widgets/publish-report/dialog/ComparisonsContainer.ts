import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {ContentVersion} from 'lib-contentstudio/app/ContentVersion';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {ComparisonBlock} from './ComparisonBlock';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import * as Q from 'q';
import {DateHelper} from '@enonic/lib-admin-ui/util/DateHelper';
import {TextAndDateBlock} from './TextAndDateBlock';

interface PublishState {
    isPublished: boolean;
    timestamp: Date;
    version?: ContentVersion;
}

export class ComparisonsContainer
    extends DivEl {

    private static CLASS_NAME: string = 'comparisons-container';

    private allVersions: ContentVersion[];

    private contentId: ContentId;

    private from: Date;

    private to: Date;

    private readonly comparisonsBlock: DivEl;

    private readonly stateAfterBlock: TextAndDateBlock;

    private readonly stateBeforeBlock: TextAndDateBlock;

    constructor() {
        super(ComparisonsContainer.CLASS_NAME);

        this.stateAfterBlock = new TextAndDateBlock('state-after-block');
        this.comparisonsBlock = new DivEl('comparisons-block');
        this.stateBeforeBlock = new TextAndDateBlock('state-before-block');
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildren(this.stateAfterBlock, this.comparisonsBlock, this.stateBeforeBlock);
            return rendered;
        });
    }

    setContentId(contentId: ContentId): this {
        this.contentId = contentId;
        return this;
    }

    setFromTo(from: Date, to?: Date): this {
        this.from = from;
        this.to = to;
        return this;
    }

    clean(): this {
        this.comparisonsBlock.removeChildren();
        return this;
    }

    setAllVersions(versions: ContentVersion[]): this {
        this.allVersions = versions;

        let hasAnyPublishedVersions: boolean = false;
        let lastBeforeToVersion: PublishState = null; // last Published/Unpublished version before TO date
        let lastBeforeFromVersion: PublishState = null; // last Published/Unpublished version before FROM date
        let firstPublishAfterFrom: Date = null; // first Published version after FROM date

        let totalPublishedWithinFromTo: number = 0;
        let newerVersion: ContentVersion = null;
        let offlineVersionInBetween: PublishState = null;

        this.allVersions.forEach((v: ContentVersion) => {
            const timestamp: Date = this.getVersionTimestamp(v);
            const isPublished: boolean = this.isPublished(v);

            if (isPublished) {
                hasAnyPublishedVersions = true;
            }

            if (this.isAfterTo(timestamp.getTime())) {
                // skip, not interested in versions after TO date
            } else if (this.isWithinFromTo(timestamp.getTime())) { // versions within FROM and TO, interested only in PUB/UNPUBLISHED ones
                if (isPublished) {
                    totalPublishedWithinFromTo++;
                    firstPublishAfterFrom = timestamp;

                    if (!lastBeforeToVersion) {
                        lastBeforeToVersion = {isPublished: true, timestamp: timestamp};
                    }

                    if (newerVersion) {
                        this.compareVersions(newerVersion, v, offlineVersionInBetween?.timestamp);
                    }

                    newerVersion = v;
                    offlineVersionInBetween = null;
                } else if (this.isUnpublished(v)) {
                    if (!lastBeforeToVersion) {
                        lastBeforeToVersion = {isPublished: false, timestamp: timestamp};
                    }

                    offlineVersionInBetween = {isPublished: false, timestamp: timestamp};
                }

            } else { // before from
                if (!lastBeforeFromVersion) {
                    if (isPublished) {
                        lastBeforeFromVersion = {isPublished: true, timestamp: timestamp, version: v};
                    } else if (this.isUnpublished(v)) {
                        lastBeforeFromVersion = {isPublished: false, timestamp: timestamp};
                    }
                }
            }

        });

        // if there's a published version before FROM date and no unpublish in between, then show comparison
        if (newerVersion && !offlineVersionInBetween && lastBeforeFromVersion?.isPublished) {
            this.compareVersions(newerVersion, lastBeforeFromVersion.version);
            totalPublishedWithinFromTo++;
        }

        this.updateHeading(lastBeforeToVersion);
        this.updateFooter(offlineVersionInBetween);

        if (!hasAnyPublishedVersions) {
            this.handleNoAnyPublishVersions();
        } else if (totalPublishedWithinFromTo === 0) {
            this.handleNoPublishVersionsWithinPeriod();
        } else if (totalPublishedWithinFromTo === 1) {
            this.handleSinglePublishVersionWithingPeriod(newerVersion);
        }

        return this;
    }

    private isWithinFromTo(time: number): boolean {
        return time && (this.from ? time >= this.from.getTime() : true) && (this.to ? time <= this.to.getTime() : true);
    }

    private isAfterTo(time: number): boolean {
        return time && (this.to ? time > this.to.getTime() : false);
    }

    private isBeforeFrom(time: number): boolean {
        return time && (this.from ? time < this.from.getTime() : false);
    }

    private isPublished(v: ContentVersion): boolean {
        return v.hasPublishInfo() && v.getPublishInfo().isPublished() && !v.getPublishInfo().isScheduled();
    }

    private isUnpublished(v: ContentVersion): boolean {
        return v.getPublishInfo()?.isUnpublished();
    }

    private getVersionTimestamp(version: ContentVersion): Date {
        if (version.hasPublishInfo()) {
            return version.getPublishInfo().getTimestamp();
        }

        return version.getTimestamp();
    }

    private handleNoAnyPublishVersions(): void {
        this.setModeClass('no-publish-versions');
        this.setHtml(i18n('widget.publishReport.mode.none'));
    }

    private handleNoPublishVersionsWithinPeriod(): void {
        this.setModeClass('no-publish-versions');
        this.setHtml(i18n('widget.publishReport.mode.offline'));
    }

    private handleSinglePublishVersionWithingPeriod(singleVersion: ContentVersion): void {
        this.setModeClass('single-publish-version');
        this.addDisplayEntireContentBlock(singleVersion);
    }

    private compareVersions(v1: ContentVersion, v2?: ContentVersion, offline?: Date): void {
        const comparisonBlock: ComparisonBlock = new ComparisonBlock()
            .setContentId(this.contentId)
            .setOfflineFrom(offline)
            .setVersions(v1, v2);

        this.comparisonsBlock.appendChild(comparisonBlock);

        comparisonBlock.load().catch(DefaultErrorHandler.handle);
    }

    private addDisplayEntireContentBlock(version: ContentVersion): void {
        this.compareVersions(version);
    }

    private setModeClass(className: string): void {
        this.setClass(`${ComparisonsContainer.CLASS_NAME} ${className}`);
    }

    private updateHeading(publishState?: PublishState): void {
        if (!publishState || publishState.isPublished) { // not showing heading if content remains online after TO date
            this.stateAfterBlock.setVisible(false);
        } else {
            this.stateAfterBlock.setVisible(true);

            const dateAsString: string = DateHelper.formatDateTime(publishState.timestamp);
            const text = i18n('widget.publishReport.state.offline.after');
            this.stateAfterBlock.setEntry(text, dateAsString);
        }
    }

    private updateFooter(unpublishedAfterFromVersion?: PublishState): void {
        if (unpublishedAfterFromVersion) { // unpublished between from and first publish after from
            const dateAsString: string = DateHelper.formatDateTime(unpublishedAfterFromVersion.timestamp);
            const text = i18n('widget.publishReport.state.offline.after');
            this.stateBeforeBlock.setEntry(text, dateAsString);
            this.stateBeforeBlock.setVisible(true);
        } else {
            this.stateBeforeBlock.setVisible(false);
        }

    }
}
