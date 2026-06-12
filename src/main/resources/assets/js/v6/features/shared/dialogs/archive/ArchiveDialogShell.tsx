import type {TaskId} from '@enonic/lib-admin-ui/task/TaskId';
import type {ContentSummary} from '@enonic/lib-contentstudio/app/content/ContentSummary';
import {useAnimatedEllipsis} from '@enonic/lib-contentstudio/v6/features/hooks/useAnimatedEllipsis';
import {useI18n} from '@enonic/lib-contentstudio/v6/features/hooks/useI18n';
import {useTaskProgress} from '@enonic/lib-contentstudio/v6/features/hooks/useTaskProgress';
import {ContentLabel} from '@enonic/lib-contentstudio/v6/features/shared/content/ContentLabel';
import {DialogPresetGatedConfirmContent} from '@enonic/lib-contentstudio/v6/features/shared/dialogs/DialogPreset';
import {ProgressDialogContent} from '@enonic/lib-contentstudio/v6/features/shared/dialogs/ProgressDialogContent';
import {InboundStatusBar} from '@enonic/lib-contentstudio/v6/features/shared/dialogs/status-bar/InboundStatusBar';
import {Button, Dialog, ListItem, Separator} from '@enonic/ui';
import {type ReactElement, useEffect, useState} from 'react';
import {ArchiveContentViewItem} from '../../../../../ArchiveContentViewItem';

type View = 'main' | 'confirmation' | 'progress';

export type ArchiveDialogShellProps = {
    open: boolean;
    items: ArchiveContentViewItem[];
    descendants: ContentSummary[];
    total: number;
    taskId: TaskId | undefined;
    ready: boolean;
    loading?: boolean;
    failed?: boolean;
    progressDescriptionKey?: string;
    onCancel: () => void;
    onExecute: () => Promise<boolean>;
    onTaskComplete: (success: boolean, message?: string) => void;
    title: string;
    description: string;
    dependantsLabel: string;
    actionButtonLabel: string;
    confirmTitle: string;
    confirmDescription: string;
    progressTitle: string;
    'data-component': string;
};

const noop = (): void => undefined;

const getProgressDescription = (
    phaseAware: boolean,
    resolving: boolean,
    resolvingDescription: string,
    progressDescription: string,
): string | undefined => {
    if (!phaseAware) {
        return undefined;
    }
    return resolving ? resolvingDescription : progressDescription;
};

export const ArchiveDialogShell = ({
    open,
    items,
    descendants,
    total,
    taskId,
    ready,
    loading = false,
    failed = false,
    progressDescriptionKey,
    onCancel,
    onExecute,
    onTaskComplete,
    title,
    description,
    dependantsLabel,
    actionButtonLabel,
    confirmTitle,
    confirmDescription,
    progressTitle,
    'data-component': dataComponent,
}: ArchiveDialogShellProps): ReactElement => {
    const [view, setView] = useState<View>('main');
    const {progress, phase, phaseTotal} = useTaskProgress(taskId, {
        onComplete: (resultState, message) => {
            onTaskComplete(resultState === 'SUCCESS', message);
        },
    });

    const phaseAware = progressDescriptionKey != null;
    const resolving = phaseAware && phase == null;
    const resolvingDescription = useAnimatedEllipsis(useI18n('dialog.statusBar.loading'), view === 'progress' && resolving);
    const progressDescription = useI18n(progressDescriptionKey ?? 'dialog.statusBar.loading', phaseTotal ?? total);

    useEffect(() => {
        if (!open) {
            setView('main');
        }
    }, [open]);

    const resetView = (): void => setView('main');

    const handleOpenChange = (next: boolean): void => {
        if (!next) {
            onCancel();
            resetView();
        }
    };

    const handleAction = async (): Promise<void> => {
        if (total > 1) {
            setView('confirmation');
            return;
        }
        setView('progress');
        const started = await onExecute();
        if (!started) {
            setView('main');
        }
    };

    const handleConfirm = async (): Promise<void> => {
        setView('progress');
        const started = await onExecute();
        if (!started) {
            setView('main');
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay />
                {view === 'main' && (
                    <Dialog.Content
                        data-component={dataComponent}
                        className="w-full h-full gap-10 sm:h-fit md:min-w-180 md:max-w-184 md:max-h-[85vh] lg:max-w-220"
                    >
                        <Dialog.DefaultHeader title={title} description={description} withClose />
                        <InboundStatusBar
                            loading={loading}
                            failed={failed}
                            errors={{inbound: {count: 0, onIgnore: noop}}}
                        />
                        <Dialog.Body className="flex flex-col gap-y-10">
                            <ul className="flex flex-col gap-y-2.5">
                                {items.map((item) => (
                                    <ListItem key={item.getId()} className="pl-0 py-0">
                                        <ListItem.Content className="flex">
                                            <div className="box-content justify-start flex-1 px-2.5 py-1">
                                                <ContentLabel content={item.getContentSummary()} variant="normal" />
                                            </div>
                                        </ListItem.Content>
                                    </ListItem>
                                ))}
                            </ul>
                            {descendants.length > 0 && (
                                <div className="flex flex-col gap-y-2.5">
                                    <Separator className="pr-1" label={dependantsLabel} />
                                    <ul className="flex flex-col gap-y-1.5">
                                        {descendants.map((content) => (
                                            <ListItem key={content.getId()} className="pl-0 py-0">
                                                <ListItem.Content className="flex">
                                                    <div className="box-content justify-start flex-1 px-2.5 py-1">
                                                        <ContentLabel content={content} variant="compact" />
                                                    </div>
                                                </ListItem.Content>
                                            </ListItem>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Dialog.Body>
                        <Dialog.Footer className="flex items-center gap-2.5">
                            <Button
                                variant="solid"
                                size="lg"
                                label={actionButtonLabel}
                                disabled={!ready}
                                onClick={() => void handleAction()}
                            />
                        </Dialog.Footer>
                    </Dialog.Content>
                )}
                {view === 'confirmation' && (
                    <DialogPresetGatedConfirmContent
                        className="sm:h-fit md:min-w-180 md:max-w-184 md:max-h-[85vh] lg:max-w-220"
                        title={confirmTitle}
                        description={confirmDescription}
                        expected={total}
                        onConfirm={() => void handleConfirm()}
                        onCancel={resetView}
                    />
                )}
                {view === 'progress' && (
                    <ProgressDialogContent
                        title={progressTitle}
                        description={getProgressDescription(phaseAware, resolving, resolvingDescription, progressDescription)}
                        progress={resolving ? undefined : progress}
                        className="w-full h-full gap-10 sm:h-fit md:min-w-180 md:max-w-184 md:max-h-[85vh] lg:max-w-220"
                    />
                )}
            </Dialog.Portal>
        </Dialog.Root>
    );
};

ArchiveDialogShell.displayName = 'ArchiveDialogShell';
