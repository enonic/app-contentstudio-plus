const VALID_LICENSE_LOADED_EVENT = 'cs-plus:valid-license-loaded';

export function fireValidLicenseLoaded(): void {
    window.dispatchEvent(new CustomEvent(VALID_LICENSE_LOADED_EVENT));
}

export function onValidLicenseLoaded(handler: () => void): () => void {
    window.addEventListener(VALID_LICENSE_LOADED_EVENT, handler);
    return () => window.removeEventListener(VALID_LICENSE_LOADED_EVENT, handler);
}
