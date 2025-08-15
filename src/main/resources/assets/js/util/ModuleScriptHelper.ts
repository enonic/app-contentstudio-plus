export function getModuleScript(widgetName: string): HTMLScriptElement {
    const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="module"]'));
    const script = scripts.find(script => script.src && script.src.includes(widgetName));

    if (!script) {
        throw Error(`Could not find module script for widget: ${widgetName}`);
    }

    return script;
}

export function getRequiredAttribute(script: HTMLScriptElement, attributeName: string): string {
    const value = script.getAttribute(attributeName);
    if (!value) {
        throw Error(`Missing '${attributeName}' attribute on script`);
    }
    return value;
}

export function getOptionalAttribute(script: HTMLScriptElement, attributeName: string): string | null {
    return script.getAttribute(attributeName);
}
