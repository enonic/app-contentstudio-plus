export class AppHelper {

    static APP_PREFIX = 'cs-plus-';

    static getCommonExtensionClass(): string {
        return `${AppHelper.APP_PREFIX}extension`;
    }

    static getCommonExtensionContainerClass(): string {
        return `${AppHelper.APP_PREFIX}extension-container`;
    }

    static getLayersExtensionClass(): string {
        return AppHelper.getExtensionClass('layers');
    }

    static getVariantsExtensionClass(): string {
        return AppHelper.getExtensionClass('variants');
    }

    static getPublishReportExtensionClass(): string {
        return AppHelper.getExtensionClass('publish-report');
    }

    private static getExtensionClass(widgetName: string): string {
        return `${AppHelper.getCommonExtensionClass()}-${widgetName}`;
    }
}
