import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import * as Q from 'q';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';
import {CheckedValueInput, ValidityStatus, ValueValidationState} from 'lib-contentstudio/app/inputtype/text/CheckedValueInput';

export class VariantNameInput
    extends CheckedValueInput {

    private variants: ContentSummaryAndCompareStatus[] = [];

    constructor() {
        super('variable-name-element');
    }

    setVariants(variants: ContentSummaryAndCompareStatus[]): VariantNameInput {
        this.variants = variants || [];
        return this;
    }

    protected getLabelText(): string {
        return i18n('widget.variants.dialog.create.input.name.label');
    }

    protected validate(value: string): Q.Promise<ValueValidationState> {
        return Q.resolve(this.doValidate(value));
    }

    private doValidate(value: string): ValueValidationState {
        if (StringHelper.isBlank(value)) {
            return new ValueValidationState(this.isRequired() ? ValidityStatus.INVALID : ValidityStatus.INVALID);
        }

        if (this.isNameOccupied(value)) {
            return new ValueValidationState(ValidityStatus.INVALID, i18n('path.not.available'));
        }

        return new ValueValidationState(ValidityStatus.VALID, i18n('path.available'));
    }

    private isNameOccupied(name: string): boolean {
        return this.variants.some((variant: ContentSummaryAndCompareStatus) => {
            return variant.getPath().getName() === name;
        });
    }

}
