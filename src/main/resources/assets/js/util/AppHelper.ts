export class AppHelper {

    static APP_PREFIX = 'cs-plus-';

    static getCommonWidgetClass(): string {
        return `${AppHelper.APP_PREFIX}widget`;
    }

    static getLayersWidgetClass(): string {
        return AppHelper.getWidgetClass('layers');
    }

    static getVariantsWidgetClass(): string {
        return AppHelper.getWidgetClass('variants');
    }

    static getAdobeWidgetClass(): string {
        return AppHelper.getWidgetClass('adobe');
    }

    private static getWidgetClass(widgetName: string): string {
        return `${AppHelper.getCommonWidgetClass()}-${widgetName}`;
    }
}
