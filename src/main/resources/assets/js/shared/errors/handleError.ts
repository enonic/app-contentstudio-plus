import {RequestAbortedError, RequestError} from '@enonic/ui-utils';
import {errorMessage, notifyError, notifyWarning} from '../notifications';

/** Logs the error and shows it as a toast: a 4xx as a warning, anything else as an error. Never throws. */
export function handleError(error: unknown): void {
    console.error(error);

    if (error instanceof RequestAbortedError) {
        return;
    }

    const isClientError = error instanceof RequestError && error.status >= 400 && error.status < 500;
    if (isClientError) {
        notifyWarning(error.message);
    } else {
        notifyError(errorMessage(error));
    }
}
