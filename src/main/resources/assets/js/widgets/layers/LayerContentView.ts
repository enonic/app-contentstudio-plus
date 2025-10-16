import {LiEl} from '@enonic/lib-admin-ui/dom/LiEl';
import {UlEl} from '@enonic/lib-admin-ui/dom/UlEl';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {LayerContent} from './LayerContent';
import {LayerContentViewDataBlock} from './LayerContentViewDataBlock';
import {LayerContentViewRelation} from './LayerContentViewRelation';

export class LayerContentView extends LiEl {

    private static VIEW_CLASS = 'layers-item-view';

    private readonly item: LayerContent;

    private readonly level: number;

    private dataBlock: LayerContentViewDataBlock;

    private childBlock: UlEl;

    constructor(layerContent: LayerContent, level: number) {
        super(LayerContentView.VIEW_CLASS);

        this.item = layerContent;
        this.level = level;

        this.initElements();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.addClass(`level-${this.level}`);
            this.appendChild(this.dataBlock);
            if (this.childBlock) {
                this.appendChild(this.childBlock);
            }

            return rendered;
        });
    }

    getItem(): ContentSummaryAndCompareStatus {
        return this.item.getItem();
    }

    hasItem(): boolean {
        return this.item.hasItem();
    }

    getLevel(): number {
        return this.level;
    }

    getDataBlock(): DivEl {
        return this.dataBlock;
    }

    setChildBlock(childBlock: UlEl) {
        this.childBlock = childBlock;
    }

    private initElements(): void {
        this.dataBlock = new LayerContentViewDataBlock(this.item, `${LayerContentView.VIEW_CLASS}-data`);
    }
}
