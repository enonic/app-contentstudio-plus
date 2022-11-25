import {Widget} from '../Widget';
import {AppHelper} from '../../util/AppHelper';
import {LayersWidgetItemView} from './LayersWidgetItemView';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import * as Q from 'q';
import {ArchiveNoLicenseBlock} from '../../ArchiveNoLicenseBlock';

export class LayersWidget
    extends Widget {

    constructor(contentId: string) {
        super(AppHelper.getLayersWidgetClass());

        this.setContentId(contentId);
        this.hasLicenseValid().then((isValid: boolean) => {
            if (isValid) {
                this.renderWidgetContent();
            } else {
                this.renderNoLicense();
            }
        }).catch(DefaultErrorHandler.handle);
    }

    private renderWidgetContent(): void {
        if (this.contentId) {
            this.renderLayers();
        } else {
            this.handleNoSelectedItem();
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

    private renderNoLicense(): void {
        this.appendChild(new ArchiveNoLicenseBlock());
    }
}
