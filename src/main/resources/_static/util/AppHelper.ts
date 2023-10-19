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

    static getPublishReportWidgetClass(): string {
        return AppHelper.getWidgetClass('publish-report');
    }

    private static getWidgetClass(widgetName: string): string {
        return `${AppHelper.getCommonWidgetClass()}-${widgetName}`;
    }
}
