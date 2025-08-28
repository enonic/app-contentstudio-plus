import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import * as Q from 'q';
import {GetLayersRequest} from '../../resource/GetLayersRequest';
import {LayerContent} from './LayerContent';
import {MultiLayersContentFilter} from './MultiLayersContentFilter';

export class MultiLayersContentLoader {

    private item: ContentSummaryAndCompareStatus;

    load(): Q.Promise<LayerContent[]> {
        return this.loadSameContentInOtherProjects().then((layerContents: LayerContent[]) => this.filter(layerContents));
    }

    setItem(item: ContentSummaryAndCompareStatus): void {
        this.item = item;
    }

    private filter(layerContents: LayerContent[]): LayerContent[] {
        return new MultiLayersContentFilter().filter(layerContents);
    }

    private loadSameContentInOtherProjects(): Q.Promise<LayerContent[]> {
        return new GetLayersRequest(this.item.getContentId()).sendAndParse();
    }
}
