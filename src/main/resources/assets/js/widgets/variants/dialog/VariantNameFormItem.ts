import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {ValidationResult} from '@enonic/lib-admin-ui/ui/form/ValidationResult';
import {Validators} from '@enonic/lib-admin-ui/ui/form/Validators';
import {TextInput} from '@enonic/lib-admin-ui/ui/text/TextInput';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';

export class VariantNameFormItem extends FormItem {

    private isVariantNameOccupied?: (name: string) => boolean;

    constructor() {
        super(new FormItemBuilder(new TextInput())
            .setValidator(Validators.required)
            .setLabel(i18n('widget.variants.dialog.create.input.name.label')));

        this.setValidator(this.validateName.bind(this));
        this.addClass('name-form-item');

        this.getNameInput().onValueChanged(() => {
            this.validate(new ValidationResult(), true);
        });
    }

    private validateName(): string {
        if (StringHelper.isBlank(this.getValue())) {
            return i18n('field.value.required');
        }

        if (this.isNameOccupied()) {
            return i18n('widget.variants.dialog.create.input.name.occupied');
        }

        return null;
    }

    private isNameOccupied(): boolean {
        return this.isVariantNameOccupied && this.isVariantNameOccupied(this.getValue());
    }

    getNameInput(): TextInput {
        return <TextInput>this.getInput();
    }

    getValue(): string {
        return this.getNameInput().getValue();
    }

    setIsNameOccupiedHandler(validator: (name: string) => boolean): void {
        this.isVariantNameOccupied = validator;
    }

    setValue(value: string, silent?: boolean): void {
        this.getNameInput().setValue(value, silent);
    }

}
