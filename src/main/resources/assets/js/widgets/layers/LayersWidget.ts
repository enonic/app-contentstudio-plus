import {Widget, WidgetConfig} from '../Widget';
import {AppHelper} from '../../util/AppHelper';
import {LayersWidgetItemView} from './LayersWidgetItemView';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import * as Q from 'q';
import {HasValidLicenseRequest} from '../../resource/HasValidLicenseRequest';
import {ArchiveNoLicenseBlock} from '../../ArchiveNoLicenseBlock';
import {SpanEl} from 'lib-admin-ui/dom/SpanEl';
import {i18n} from 'lib-admin-ui/util/Messages';

export class LayersWidget
    extends Widget {

    constructor(config: WidgetConfig) {
        super(config, AppHelper.getLayersWidgetClass());

        this.hasLicenseValid().then((isValid: boolean) => {
            if (isValid) {
                this.renderWidgetContent();
            } else {
                this.renderNoLicense();
            }
        }).catch(DefaultErrorHandler.handle);
    }

    private hasLicenseValid(): Q.Promise<boolean> {
        return new HasValidLicenseRequest().sendAndParse();
    }

    private renderWidgetContent(): void {
        if (this.contentId) {
            this.renderLayers();
        } else {
            this.renderNoSelectedItem();
        }
    }

    private renderLayers(): void {
        const layersWidgetItemView: LayersWidgetItemView = LayersWidgetItemView.get();

        this.fetchContent().then((content: ContentSummaryAndCompareStatus) => {
            void layersWidgetItemView.setContentAndUpdateView(content);
            this.appendChild(layersWidgetItemView);
        }).catch(DefaultErrorHandler.handle);
    }

    private fetchContent(): Q.Promise<ContentSummaryAndCompareStatus> {
        return new ContentSummaryAndCompareStatusFetcher().fetch(new ContentId(this.contentId));
    }

    private renderNoSelectedItem(): void {
        this.appendChild(new SpanEl('error').setHtml(i18n('notify.archive.widget.noselection')));
    }

    private renderNoLicense(): void {
        this.appendChild(new ArchiveNoLicenseBlock());
    }
}
