import type {ContentSummary} from '@enonic/lib-contentstudio/app/content/ContentSummary';
import {useAnimatedEllipsis} from '@enonic/lib-contentstudio/v6/shared/lib/hooks/useAnimatedEllipsis';
import {useInfiniteScroll} from '@enonic/lib-contentstudio/v6/shared/lib/hooks/useInfiniteScroll';
import {useTaskProgress} from '@enonic/lib-contentstudio/v6/entities/task/useTaskProgress';
import {ContentLabel} from '@enonic/lib-contentstudio/v6/entities/content/ui/content/ContentLabel';
import {Button, Dialog, ListItem, Separator} from '@enonic/ui';
import {ActionDialog, type DialogIntent, Gate, useActionDialog, useUiKitPhrases} from '@enonic/ui-kit';
import {type ReactElement, type ReactNode, type RefObject, useCallback, useEffect, useRef, useState} from 'react';
import {useI18n} from '../../../../../shared/i18n';
import {useDialogInitialFocus} from '../../lib/hooks/useDialogInitialFocus';
import {ProgressBar} from '../../ui/ProgressBar';
import {ArchiveContentViewItem} from '../../../../../ArchiveContentViewItem';
import {ArchiveLoadStatus} from './ArchiveLoadStatus';

type View = 'main' | 'confirmation' | 'progress';

export type ArchiveDialogShellProps = {
    open: boolean;
    items: ArchiveContentViewItem[];
    descendants: ContentSummary[];
    total: number;
    taskId: string | undefined;
    ready: boolean;
    loading?: boolean;
    failed?: boolean;
    intent?: DialogIntent;
    progressDescriptionKey?: string;
    hasMore?: boolean;
    onLoadMoreDescendants?: () => void | Promise<void>;
    onCancel: () => void;
    onExecute: () => Promise<boolean>;
    onTaskComplete: (success: boolean, message?: string) => void;
    title: string;
    description: string;
    dependantsLabel: string;
    actionButtonLabel: string;
    confirmTitle: string;
    confirmQuestion: string;
    progressTitle: string;
    'data-component': string;
};

const CONTENT_CLASS_NAME = 'h-full sm:h-fit md:max-h-[85vh]';

const preventDefault = (event: Event): void => event.preventDefault();

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

type GatedConfirmProps = {
    title: string;
    question: ReactNode;
    expected: number;
    intent: DialogIntent;
    onConfirm: () => void;
    'data-component': string;
};

const GatedConfirmParts = ({title, question, expected, intent, onConfirm, gateInputRef}: Omit<GatedConfirmProps, 'data-component'> & {
    gateInputRef: RefObject<HTMLInputElement | null>;
}): ReactElement => {
    const t = useUiKitPhrases();
    const {confirmEnabled} = useActionDialog();
    const confirmRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (confirmEnabled) {
            confirmRef.current?.focus();
        }
    }, [confirmEnabled]);

    return (
        <>
            <ActionDialog.DefaultHeader title={title} />
            <ActionDialog.Body>
                <div>{question}</div>
                <Gate>
                    <Gate.Hint value={expected} />
                    <Gate.Input ref={gateInputRef} expected={expected} />
                </Gate>
            </ActionDialog.Body>
            <ActionDialog.Footer>
                <Dialog.Shortcut shortcut="secondary" asChild>
                    <Dialog.Close asChild>
                        <Button variant="outline" size="lg" label={t('enonic.uiKit.dialog.cancel')} />
                    </Dialog.Close>
                </Dialog.Shortcut>
                <Dialog.Shortcut asChild>
                    <ActionDialog.Action
                        ref={confirmRef}
                        label={t(intent === 'danger' ? 'enonic.uiKit.dialog.delete' : 'enonic.uiKit.dialog.confirm')}
                        intent={intent}
                        closeOnClick={false}
                        onClick={onConfirm}
                    />
                </Dialog.Shortcut>
            </ActionDialog.Footer>
        </>
    );
};

GatedConfirmParts.displayName = 'GatedConfirm.Parts';

const GatedConfirm = ({'data-component': dataComponent, ...props}: GatedConfirmProps): ReactElement => {
    const gateInputRef = useRef<HTMLInputElement>(null);

    return (
        <ActionDialog.Content
            data-component={dataComponent}
            size="medium"
            defaultConfirmEnabled={false}
            onOpenAutoFocus={(event: Event) => {
                event.preventDefault();
                gateInputRef.current?.focus();
            }}
        >
            <GatedConfirmParts {...props} gateInputRef={gateInputRef} />
        </ActionDialog.Content>
    );
};

GatedConfirm.displayName = 'GatedConfirm';

export const ArchiveDialogShell = ({
    open,
    items,
    descendants,
    total,
    taskId,
    ready,
    loading = false,
    failed = false,
    intent = 'default',
    progressDescriptionKey,
    hasMore = false,
    onLoadMoreDescendants,
    onCancel,
    onExecute,
    onTaskComplete,
    title,
    description,
    dependantsLabel,
    actionButtonLabel,
    confirmTitle,
    confirmQuestion,
    progressTitle,
    'data-component': dataComponent,
}: ArchiveDialogShellProps): ReactElement => {
    const [view, setView] = useState<View>('main');
    const actionButtonRef = useRef<HTMLButtonElement>(null);
    const handleOpenAutoFocus = useDialogInitialFocus(actionButtonRef, ready && view === 'main');
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const handleLoadMore = useCallback((): void => {
        if (isLoadingMore || !onLoadMoreDescendants) {
            return;
        }
        setIsLoadingMore(true);
        void Promise.resolve(onLoadMoreDescendants()).finally(() => setIsLoadingMore(false));
    }, [isLoadingMore, onLoadMoreDescendants]);
    const sentinelRef = useInfiniteScroll<HTMLDivElement>({
        hasMore,
        isLoading: isLoadingMore,
        onLoadMore: handleLoadMore,
    });
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

    const handleOpenChange = (next: boolean): void => {
        if (!next) {
            onCancel();
            setView('main');
        }
    };

    const execute = async (): Promise<void> => {
        setView('progress');
        const started = await onExecute();
        if (!started) {
            setView('main');
        }
    };

    const handleAction = (): void => {
        if (total > 1) {
            setView('confirmation');
            return;
        }
        void execute();
    };

    return (
        <ActionDialog.Root open={open} onOpenChange={handleOpenChange}>
            <ActionDialog.Portal>
                <ActionDialog.Overlay />
                {view === 'main' && (
                    <ActionDialog.Content
                        data-component={dataComponent}
                        size="wide"
                        onOpenAutoFocus={handleOpenAutoFocus}
                        className={CONTENT_CLASS_NAME}
                    >
                        <ActionDialog.DefaultHeader title={title} description={description} withClose />
                        <ArchiveLoadStatus loading={loading} failed={failed} />
                        <ActionDialog.Body className="gap-y-10">
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
                                    {hasMore && <div ref={sentinelRef} aria-hidden className="h-px w-full" />}
                                </div>
                            )}
                        </ActionDialog.Body>
                        <ActionDialog.Footer>
                            <Dialog.Shortcut asChild>
                                <ActionDialog.Action
                                    data-component="Button"
                                    ref={actionButtonRef}
                                    label={actionButtonLabel}
                                    intent={intent}
                                    disabled={!ready}
                                    closeOnClick={false}
                                    onClick={handleAction}
                                />
                            </Dialog.Shortcut>
                        </ActionDialog.Footer>
                    </ActionDialog.Content>
                )}
                {view === 'confirmation' && (
                    <GatedConfirm
                        data-component={`${dataComponent}Confirm`}
                        title={confirmTitle}
                        question={confirmQuestion}
                        expected={total}
                        intent={intent}
                        onConfirm={() => void execute()}
                    />
                )}
                {view === 'progress' && (
                    <ActionDialog.Content
                        data-component={`${dataComponent}Progress`}
                        size="wide"
                        className={CONTENT_CLASS_NAME}
                        onEscapeKeyDown={preventDefault}
                        onPointerDownOutside={preventDefault}
                    >
                        <ActionDialog.DefaultHeader
                            title={progressTitle}
                            description={getProgressDescription(phaseAware, resolving, resolvingDescription, progressDescription)}
                        />
                        <ActionDialog.Body className="pb-10">
                            {!resolving && <ProgressBar value={progress} />}
                        </ActionDialog.Body>
                    </ActionDialog.Content>
                )}
            </ActionDialog.Portal>
        </ActionDialog.Root>
    );
};

ArchiveDialogShell.displayName = 'ArchiveDialogShell';
