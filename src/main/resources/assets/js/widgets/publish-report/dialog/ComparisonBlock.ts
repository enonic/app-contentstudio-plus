import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {Delta, DiffPatcher, formatters, HtmlFormatter} from 'jsondiffpatch';
import * as Q from 'q';
import {ContentVersion} from 'lib-contentstudio/app/ContentVersion';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {GetContentVersionRequest} from 'lib-contentstudio/app/resource/GetContentVersionRequest';
import {ContentJson} from 'lib-contentstudio/app/content/ContentJson';
import {Checkbox, CheckboxBuilder} from '@enonic/lib-admin-ui/ui/Checkbox';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {DateHelper} from '@enonic/lib-admin-ui/util/DateHelper';
import {LoadMask} from '@enonic/lib-admin-ui/ui/mask/LoadMask';
import {ComparisonHelper} from './ComparisonHelper';
import {TextAndDateBlock} from './TextAndDateBlock';
import {ComparisonMode} from './ComparisonMode';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';

export class ComparisonBlock
    extends DivEl {

    private static cache: Map<string, Q.Promise<ContentJson>> = new Map<string, Q.Promise<ContentJson>>();

    private readonly diffElement: DivEl;

    private readonly headerElement: DivEl;

    private readonly titleElement: TextAndDateBlock;

    private readonly changesCheckbox: Checkbox;

    private readonly loadMask: LoadMask;


    private readonly diffPatcher: DiffPatcher;

    private readonly htmlFormatter: HtmlFormatter;


    private contentId: ContentId;

    private newerVersion: ContentVersion;

    private olderVersion?: ContentVersion;

    private offlineFrom?: Date;

    constructor() {
        super('comparison-block');

        this.diffPatcher = new DiffPatcher();
        this.htmlFormatter = formatters.html;

        this.diffElement = new DivEl('compare-element jsondiffpatch-delta');
        this.headerElement = new DivEl('header');
        this.titleElement = new TextAndDateBlock();
        this.loadMask = new LoadMask(this.diffElement);

        this.changesCheckbox = new CheckboxBuilder().setLabelText(i18n('field.content.showEntire')).build();

        this.initListeners();
    }

    setContentId(contentId: ContentId): this {
        this.contentId = contentId;
        return this;
    }

    setVersions(newerVersion: ContentVersion, olderVersion?: ContentVersion): this {
        this.newerVersion = newerVersion;
        this.olderVersion = olderVersion;

        this.changesCheckbox.setVisible(!!olderVersion);

        return this;
    }

    setOfflineFrom(from: Date): this {
        this.offlineFrom = from;
        return this;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.headerElement.appendChild(this.titleElement);
            this.headerElement.appendChild(this.changesCheckbox);


            this.appendChild(this.headerElement);

            if (this.offlineFrom) {
                this.appendChild(this.createOfflineSubtitle());
            }

            this.appendChild(this.diffElement);

            return rendered;
        });
    }

    load(): Q.Promise<void> {
        this.htmlFormatter.showUnchanged(!this.olderVersion, this.diffElement.getHTMLElement(), 0);

        const promises = [
            this.fetchVersionPromise(this.newerVersion),
            this.fetchVersionPromise(this.olderVersion)
        ];

        this.updateHeader();

        this.loadMask.show();
        this.addClass('loading');

        return Q.all(promises).spread((newerVersionJson: Object, olderVersionJson?: Object) => {
            if (this.olderVersion) {
                this.displayDiff(newerVersionJson, olderVersionJson);
            } else {
                this.displaySingleVersion(newerVersionJson);
            }
        }).finally(() => {
            this.removeClass('loading');
            this.loadMask.hide();
        });
    }

    private displayDiff(newerVersionJson: Object, olderVersionJson: Object): void {
        const delta: Delta = this.diffPatcher.diff(olderVersionJson, newerVersionJson);
        const text = !!delta ? formatters.html.format(delta, newerVersionJson) :
                     `<h3>${i18n('dialog.compareVersions.versionsIdentical')}</h3>`;
        this.diffElement.setHtml(text, false).toggleClass('empty', !delta);
    }

    private displaySingleVersion(versionJson: Object): void {
        const text = formatters.html.format({}, versionJson);
        this.diffElement.setHtml(text, false);
    }

    private initListeners(): void {
        this.changesCheckbox.onValueChanged(event => {
            this.htmlFormatter.showUnchanged(event.getNewValue() === 'true', this.diffElement.getHTMLElement(), 0);
        });
    }

    private fetchVersionPromise(version: ContentVersion): Q.Promise<Object> {
        if (!version) {
            return Q.resolve(null);
        }

        const versionId: string = version.getId();

        if (ComparisonBlock.cache.has(versionId)) {
            return ComparisonBlock.cache.get(versionId);
        }

        const promise: Q.Promise<ContentJson> = new GetContentVersionRequest(this.contentId)
            .setVersion(versionId)
            .sendRequest().then((content: ContentJson) => {
                return ComparisonHelper.processContentJson(content);
            });

        ComparisonBlock.cache.set(version.getId(), promise);

        return promise;
    }

    private updateHeader(): void {
        const newerVersionDate = DateHelper.formatDateTime(this.newerVersion.getPublishInfo().getTimestamp());
        const olderVersionDate = this.olderVersion ? DateHelper.formatDateTime(this.olderVersion.getPublishInfo().getTimestamp()) : null;

        if (olderVersionDate) {
            this.titleElement
                .setEntry(i18n('widget.publishReport.dateRange.compare.title.part1'), olderVersionDate)
                .addEntry(i18n('widget.publishReport.dateRange.compare.title.part2'), newerVersionDate);
        } else {
            this.titleElement.setEntry(i18n('status.published'), newerVersionDate);
        }
    }

    private createOfflineSubtitle(): TextAndDateBlock {
        const subtitle = new TextAndDateBlock('subtitle');
        const text = i18n('widget.publishReport.dateRange.compare.subtitle');
        const datePart = DateHelper.formatDateTime(this.offlineFrom);

        subtitle.setEntry(text, datePart);

        return subtitle;
    }

    private makeTextPart(text: string, className: string): SpanEl {
        return new SpanEl(className).setHtml(text);
    }

    private makeDatePart(date: Date, className: string): SpanEl {
        return new SpanEl(className).setHtml(DateHelper.formatDateTime(date));
    }
}
