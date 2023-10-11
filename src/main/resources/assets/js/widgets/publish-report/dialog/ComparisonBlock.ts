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
import {ComparisonTitle} from './ComparisonTitle';
import {ComparisonMode} from './ComparisonMode';

export class ComparisonBlock
    extends DivEl {

    private static cache: Map<string, Q.Promise<ContentJson>> = new Map<string, Q.Promise<ContentJson>>();

    private readonly diffElement: DivEl;

    private readonly headerElement: DivEl;

    private readonly titleElement: ComparisonTitle;

    private readonly changesCheckbox?: Checkbox;

    private readonly loadMask: LoadMask;


    private readonly diffPatcher: DiffPatcher;

    private readonly htmlFormatter: HtmlFormatter;

    private readonly mode: ComparisonMode;


    private contentId: ContentId;

    private newerVersion: ContentVersion;

    private olderVersion: ContentVersion;

    constructor(mode?: ComparisonMode) {
        super('comparison-block');

        this.mode = mode ?? ComparisonMode.COMPARE;
        this.diffPatcher = new DiffPatcher();
        this.htmlFormatter = formatters.html;

        this.diffElement = new DivEl('compare-element jsondiffpatch-delta');
        this.headerElement = new DivEl('header');
        this.titleElement = new ComparisonTitle(this.mode);
        this.loadMask = new LoadMask(this.diffElement);

        this.changesCheckbox = this.isCompareMode() ? new CheckboxBuilder().setLabelText(i18n('field.content.showEntire')).build() : null;

        this.initListeners();
    }

    setContentId(contentId: ContentId): this {
        this.contentId = contentId;
        return this;
    }

    setVersions(newerVersion: ContentVersion, olderVersion: ContentVersion): this {
        this.newerVersion = newerVersion;
        this.olderVersion = olderVersion;
        return this;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.headerElement.appendChild(this.titleElement);

            if (this.isCompareMode()) {
                this.headerElement.appendChild(this.changesCheckbox);
            }

            this.appendChildren(this.headerElement, this.diffElement);

            return rendered;
        });
    }

    load(): Q.Promise<void> {
        this.htmlFormatter.showUnchanged(this.isDisplaySingleMode(), this.diffElement.getHTMLElement(), 0);

        const promises = [
            this.fetchVersionPromise(this.newerVersion),
            this.fetchVersionPromise(this.olderVersion)
        ];

        this.updateHeader();

        this.loadMask.show();
        this.addClass('loading');

        return Q.all(promises).spread((newerVersionJson: Object, olderVersionJson: Object) => {
            if (this.isCompareMode()) {
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
        this.changesCheckbox?.onValueChanged(event => {
            this.htmlFormatter.showUnchanged(event.getNewValue() === 'true', this.diffElement.getHTMLElement(), 0);
        });
    }

    private fetchVersionPromise(version: ContentVersion): Q.Promise<Object> {
        const versionId = version.getId();

        if (ComparisonBlock.cache.has(versionId)) {
            return ComparisonBlock.cache.get(versionId);
        }

        const promise = new GetContentVersionRequest(this.contentId)
            .setVersion(versionId)
            .sendRequest().then(content => {
                return ComparisonHelper.processContentJson(content, version);
            });

        ComparisonBlock.cache.set(version.getId(), promise);

        return promise;
    }

    private updateHeader(): void {
        const newerVersionDate = DateHelper.formatDateTime(this.newerVersion.getPublishInfo().getTimestamp());
        const olderVersionDate = this.isCompareMode() ? DateHelper.formatDateTime(this.olderVersion.getPublishInfo().getTimestamp()) : null;
        this.titleElement.setDates(newerVersionDate, olderVersionDate);
    }

    private isCompareMode(): boolean {
        return this.mode === ComparisonMode.COMPARE;
    }

    private isDisplaySingleMode(): boolean {
        return this.mode === ComparisonMode.DISPLAY_SINGLE;
    }

}
