import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {MenuButton} from '@enonic/lib-admin-ui/ui/button/MenuButton';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentWindowHelper} from '../../dialog/ContentWindowHelper';
import * as Q from 'q';
import {DuplicateVariantDialog} from '../../dialog/DuplicateVariantDialog';
import {CreateVariantDialog} from '../../dialog/CreateVariantDialog';
import {GetContentVariantsRequest} from '../../resource/request/GetContentVariantsRequest';

export class VariantsListItemViewMenuButton
    extends MenuButton {

    private item: ContentSummaryAndCompareStatus;

    constructor() {
        super(new Action(), [new Action(i18n('action.edit'))]);
    }

    protected initListeners(): void {
        super.initListeners();

        this.mainAction.onExecuted(this.handleMainActionExecuted.bind(this));
        this.menuActions[0].onExecuted(this.handleSecondaryActionExecuted.bind(this));
        this.onClicked((e: MouseEvent) => e.stopPropagation());
    }

    private handleMainActionExecuted(): void {
        if (this.item.isVariant()) {
            this.openDuplicateDialog();
        } else {
            this.openCreateVersionDialog();
        }
    }

    private openDuplicateDialog(): void {
        DuplicateVariantDialog.get()
            .setContentToDuplicate([this.item])
            .setOpenTabAfterDuplicate(true)
            .open();
    }

    private openCreateVersionDialog(): void {
        CreateVariantDialog.get().setContent(this.item).setVariants(GetContentVariantsRequest.getCachedVariants(this.item.getId())).open();
    }

    private handleSecondaryActionExecuted(): void {
        new ContentWindowHelper(this.item.getId()).openEditWizard();
    }

    setItem(item: ContentSummaryAndCompareStatus): VariantsListItemViewMenuButton {
        this.item = item;
        this.updateMainActionLabel();

        return this;
    }

    private updateMainActionLabel(): void {
        const label: string = this.item.isVariant() ? i18n('action.duplicate') : i18n('widget.variants.create.text');
        this.mainAction.setLabel(label);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('variants-actions-menu');

            return rendered;
        });
    }
}
