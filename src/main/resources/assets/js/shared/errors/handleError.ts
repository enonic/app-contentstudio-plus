import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {showError, showWarning} from '@enonic/lib-admin-ui/notify/MessageBus';
import {AppError, RequestAbortedError, RequestError} from '@enonic/ui-utils';

// `DefaultErrorHandler` rethrows anything that is not a lib-admin-ui `Exception`.
export function handleError(error: unknown): void {
    if (!(error instanceof AppError)) {
        DefaultErrorHandler.handle(error);
        return;
    }

    console.error(error);

    if (error instanceof RequestAbortedError) {
        return;
    }

    const isClientError = error instanceof RequestError && error.status >= 400 && error.status < 500;
    if (isClientError) {
        showWarning(error.message);
    } else {
        showError(error.message);
    }
}
