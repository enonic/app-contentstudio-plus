export class AppHelper {

    static APP_PREFIX = 'cs-plus-';

    static STUDIO_URI_PROPERTY_NAME = 'studioToolUri';

    static getCommonWidgetClass(): string {
        return `${AppHelper.APP_PREFIX}widget`;
    }

    static getLayersWidgetClass(): string {
        return AppHelper.getWidgetClass('layers');
    }

    static getVariantsWidgetClass(): string {
        return AppHelper.getWidgetClass('variants');
    }

    private static getWidgetClass(widgetName: string): string {
        return `${AppHelper.getCommonWidgetClass()}-${widgetName}`;
    }
}
