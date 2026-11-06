import {NotificationList} from '@enonic/ui-kit';
import {createRoot} from 'react-dom/client';
import {notifications} from '../shared/notifications';
import {ExtensionRoot} from './ExtensionRoot';
import {$hostTheme, syncTheme} from './hostTheme';

// Same corner as the legacy `.notification-container`, one above its `z-index: 2004`,
// so a toast is never covered while the two stacks share the screen.
const NOTIFICATIONS_POSITION =
    'pointer-events-none fixed right-0 bottom-0 z-[2005] w-full px-2 pb-2 ' +
    'sm:right-9 sm:bottom-6 sm:max-w-115 sm:p-0 ' +
    'md:right-11.5 md:bottom-7.5 lg:right-15 lg:bottom-10 2xl:right-23 2xl:bottom-15';

let host: HTMLElement | undefined;

/**
 * Renders this bundle's toast stack in its own root on `body`, where the host page's
 * stylesheet reaches it. Called once by every entry; a second call is a no-op.
 */
export function mountNotifications(): void {
    if (host != null) {
        return;
    }

    host = document.createElement('div');
    document.body.appendChild(host);

    $hostTheme.subscribe((theme) => syncTheme(host, theme));

    createRoot(host).render(
        <ExtensionRoot>
            <NotificationList notifications={notifications} className={NOTIFICATIONS_POSITION} />
        </ExtensionRoot>,
    );
}
