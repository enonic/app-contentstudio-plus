import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import type {ContentVersion} from '@enonic/lib-contentstudio/app/ContentVersion';
import {useI18n} from '@enonic/lib-contentstudio/v6/features/hooks/useI18n';
import {Button, Dialog} from '@enonic/ui';
import {Printer} from 'lucide-react';
import {type ReactElement, useEffect, useState} from 'react';
import {fetchPublishReportData} from '../../../../api/publish-report';
import {Comparisons} from './Comparisons';
import {printReport} from './printReport';

const PUBLISH_REPORT_DIALOG_NAME = 'PublishReportDialog';

export type PublishReportDialogProps = {
    open: boolean;
    onClose: () => void;
    contentId: string;
    isArchived: boolean;
    from: Date;
    to: Date;
    portalContainer?: HTMLElement | null;
    injected?: boolean;
};

export const PublishReportDialog = ({
    open,
    onClose,
    contentId,
    isArchived,
    from,
    to,
    portalContainer,
    injected = false,
}: PublishReportDialogProps): ReactElement => {
    const [path, setPath] = useState<string | undefined>(undefined);
    const [versions, setVersions] = useState<ContentVersion[] | null>(null);

    const title = useI18n('widget.publishReport.dialog.title');
    const printLabel = useI18n('widget.publishReport.dialog.button.print');

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
            .catch((reason: unknown) => DefaultErrorHandler.handle(reason));

        return () => {
            cancelled = true;
        };
    }, [open, contentId, isArchived]);

    const handleOpenChange = (next: boolean): void => {
        if (!next) onClose();
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal container={portalContainer ?? undefined}>
                <Dialog.Overlay />
                <Dialog.Content
                    data-component={PUBLISH_REPORT_DIALOG_NAME}
                    className="w-full h-full gap-5 sm:h-fit md:max-h-[85vh]"
                    style={{minWidth: 'min(736px, 100%)', maxWidth: '880px'}}
                >
                    <Dialog.DefaultHeader title={title} description={path} withClose />
                    <Dialog.Body className="flex flex-col gap-5 min-h-0">
                        <div className="flex-1 min-h-0 overflow-auto bg-surface-neutral py-3">
                            {versions && (
                                <Comparisons contentId={contentId} versions={versions} from={from} to={to} />
                            )}
                        </div>
                    </Dialog.Body>
                    <Dialog.Footer className="flex items-center justify-end gap-2.5">
                        <Button
                            startIcon={Printer}
                            variant="outline"
                            size="lg"
                            label={printLabel}
                            onClick={injected ? printReport : () => window.print()}
                        />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

PublishReportDialog.displayName = PUBLISH_REPORT_DIALOG_NAME;
