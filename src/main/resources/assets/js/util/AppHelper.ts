export class AppHelper {

    static APP_PREFIX: string = 'cs-plus-';

    static getCommonWidgetClass(): string {
        return `${AppHelper.APP_PREFIX}widget`;
    }

    private static getWidgetClass(widgetName: string): string {
        return `${AppHelper.getCommonWidgetClass()}-${widgetName}`;
    }

    static getLayersWidgetClass(): string {
        return AppHelper.getWidgetClass('layers');
    }
}
