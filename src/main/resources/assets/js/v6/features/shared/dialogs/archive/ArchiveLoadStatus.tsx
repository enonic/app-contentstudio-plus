import {cn} from '@enonic/ui';
import {CircleAlert, LoaderCircle} from 'lucide-react';
import type {ReactElement} from 'react';
import {useI18n} from '../../../../../shared/i18n';

const ARCHIVE_LOAD_STATUS_NAME = 'ArchiveLoadStatus';

export type ArchiveLoadStatusProps = {
    loading: boolean;
    failed: boolean;
};

export const ArchiveLoadStatus = ({loading, failed}: ArchiveLoadStatusProps): ReactElement | null => {
    const loadingText = useI18n('dialog.statusBar.loading');
    const failedText = useI18n('dialog.statusBar.error.failed.text');

    if (!loading && !failed) {
        return null;
    }

    return (
        <div
            data-component={ARCHIVE_LOAD_STATUS_NAME}
            role={failed ? 'alert' : 'status'}
            className={cn('flex items-center gap-2 p-5 rounded-lg md:min-h-19', failed && !loading && 'bg-surface-error')}
        >
            {loading
                ? <LoaderCircle className="size-7 animate-spin text-subtle" />
                : <CircleAlert className="size-6 text-error" />}
            <span className="text-sm font-semibold">{loading ? loadingText : failedText}</span>
        </div>
    );
};

ArchiveLoadStatus.displayName = ARCHIVE_LOAD_STATUS_NAME;
