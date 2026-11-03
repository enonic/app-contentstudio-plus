import {handleError} from '../../../../../../shared/errors';
import {useI18n} from '../../../../../../shared/i18n';
import {Dialog} from '@enonic/ui';
import {ActionDialog} from '@enonic/ui-kit';
import {Printer} from 'lucide-react';
import {type ReactElement, useEffect, useRef, useState} from 'react';
import {useDialogInitialFocus} from '../../../../shared/lib/hooks/useDialogInitialFocus';
import {fetchPublishReportData} from '../../../../api/publish-report';
import {Comparisons} from './Comparisons';
import type {ContentVersion} from '../../../../shared/content/contentVersion';
import {printReport} from './printReport';

const PUBLISH_REPORT_DIALOG_NAME = 'PublishReportDialog';

export type PublishReportDialogProps = {
    open: boolean;
    onClose: () => void;
    contentId: string;
    isArchived: boolean;
    from: Date;
    to: Date;
    injected?: boolean;
};

export const PublishReportDialog = ({
    open,
    onClose,
    contentId,
    isArchived,
    from,
    to,
    injected = false,
}: PublishReportDialogProps): ReactElement => {
    const [path, setPath] = useState<string | undefined>(undefined);
    const [versions, setVersions] = useState<ContentVersion[] | null>(null);

    const title = useI18n('widget.publishReport.dialog.title');
    const printLabel = useI18n('widget.publishReport.dialog.button.print');
    const printButtonRef = useRef<HTMLButtonElement>(null);
    const handleOpenAutoFocus = useDialogInitialFocus(printButtonRef);

    useEffect(() => {
        if (!open) {
            setPath(undefined);
            setVersions(null);
            return;
        }

        let cancelled = false;
        fetchPublishReportData(contentId, isArchived)
            .then(({path: nextPath, versions: nextVersions}) => {
                if (cancelled) return;
                setPath(nextPath);
                setVersions(nextVersions);
            })
            .catch((reason: unknown) => handleError(reason));

        return () => {
            cancelled = true;
        };
    }, [open, contentId, isArchived]);

    const handleOpenChange = (next: boolean): void => {
        if (!next) onClose();
    };

    return (
        <ActionDialog.Root open={open} onOpenChange={handleOpenChange}>
            <ActionDialog.Portal>
                <ActionDialog.Overlay />
                <ActionDialog.Content
                    data-component={PUBLISH_REPORT_DIALOG_NAME}
                    size="wide"
                    onOpenAutoFocus={handleOpenAutoFocus}
                    className="h-full max-sm:max-h-none sm:h-fit max-sm:p-3 md:max-h-[85vh] md:min-w-184"
                >
                    <ActionDialog.DefaultHeader className="max-sm:p-2" title={title} description={path} withClose />
                    <ActionDialog.Body className="gap-5 min-h-0">
                        <div className="flex-1 min-h-0 overflow-auto bg-surface-neutral py-3">
                            {versions && (
                                <Comparisons contentId={contentId} versions={versions} from={from} to={to} />
                            )}
                        </div>
                    </ActionDialog.Body>
                    <ActionDialog.Footer>
                        <Dialog.Shortcut asChild>
                            <ActionDialog.Action
                                data-component="Button"
                                ref={printButtonRef}
                                startIcon={Printer}
                                variant="outline"
                                label={printLabel}
                                closeOnClick={false}
                                onClick={injected ? printReport : () => window.print()}
                            />
                        </Dialog.Shortcut>
                    </ActionDialog.Footer>
                </ActionDialog.Content>
            </ActionDialog.Portal>
        </ActionDialog.Root>
    );
};

PublishReportDialog.displayName = PUBLISH_REPORT_DIALOG_NAME;
