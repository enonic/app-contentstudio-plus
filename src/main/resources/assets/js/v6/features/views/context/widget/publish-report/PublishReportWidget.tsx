import {useI18n} from '@enonic/lib-contentstudio/v6/shared/lib/hooks/useI18n';
import {Button, DatePicker, Input, usePrefixedId} from '@enonic/ui';
import {type ReactElement, useEffect, useMemo, useRef, useState} from 'react';
import {AppHelper} from '../../../../../../util/AppHelper';
import {PublishReportDialog} from './PublishReportDialog';

const PUBLISH_REPORT_WIDGET_NAME = 'PublishReportWidget';

const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const parseDate = (value: string): Date | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const [, ys, ms, ds] = match;
    const y = +ys;
    const mo = +ms;
    const d = +ds;
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return dt;
};

const startOfDay = (date: Date): Date => {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
};

const endOfDay = (date: Date): Date => {
    const next = new Date(date);
    next.setHours(23, 59, 59, 999);
    return next;
};

type DateInputProps = {
    label: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    onError?: (error: string | undefined) => void;
    error?: string;
    portalContainer: HTMLElement | null;
};

const DateInput = ({label, value, onChange, onError, error, portalContainer}: DateInputProps): ReactElement => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(formatDate(value));
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const inputId = usePrefixedId(null, 'pr-date-input-');
    const invalidFormatError = useI18n('widget.publishReport.dateRange.invalid.value');

    useEffect(() => {
        setText(formatDate(value));
    }, [value]);

    useEffect(() => {
        if (!open) return;
        requestAnimationFrame(() => {
            const grid = contentRef.current?.querySelector('[role="grid"]');
            if (grid instanceof HTMLElement) grid.focus();
        });
    }, [open]);

    const handleInputChange = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        const next = (event.target as HTMLInputElement).value;
        setText(next);

        if (!next.trim()) {
            onChange(null);
            onError?.(undefined);
            return;
        }

        const parsed = parseDate(next);
        if (parsed) {
            onChange(parsed);
            onError?.(undefined);
        } else {
            onError?.(invalidFormatError);
        }
    };

    const handleInputBlur = (): void => {
        if (!text.trim()) return;
        const parsed = parseDate(text);
        if (parsed) {
            setText(formatDate(parsed));
        }
    };

    const handleInputKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Enter' || event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
        }
    };

    const handleDayPick = (next: Date | null): void => {
        onChange(next);
        onError?.(undefined);
        setText(next ? formatDate(next) : '');
    };

    return (
        <DatePicker
            value={value}
            onValueChange={handleDayPick}
            open={open}
            onOpenChange={setOpen}
            focusOnCloseRef={inputRef}
            className="w-full"
        >
            <div ref={wrapperRef}>
                <Input
                    id={inputId}
                    ref={inputRef}
                    label={label}
                    placeholder="YYYY-MM-DD"
                    value={text}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    error={error}
                    endAddon={
                        <div className="flex h-full w-11 items-center justify-center bg-transparent">
                            <DatePicker.Trigger className="size-8" aria-label={label} />
                        </div>
                    }
                />
            </div>
            <DatePicker.Portal container={portalContainer}>
                <DatePicker.Content ref={contentRef} className="max-w-100" align="end" anchorRef={wrapperRef}>
                    <div className="flex flex-col gap-2">
                        <DatePicker.Header />
                        <div className="flex flex-col gap-2">
                            <DatePicker.Weekdays />
                            <DatePicker.Grid />
                        </div>
                    </div>
                </DatePicker.Content>
            </DatePicker.Portal>
        </DatePicker>
    );
};

export type PublishReportWidgetProps = {
    contentId: string;
    firstPublished: Date | null;
    isArchived: boolean;
    injected?: boolean;
};

export const PublishReportWidget = ({
    contentId,
    firstPublished,
    isArchived,
    injected = false,
}: PublishReportWidgetProps): ReactElement => {
    const today = useMemo(() => endOfDay(new Date()), []);
    const firstPublishedStart = useMemo(
        () => (firstPublished ? startOfDay(firstPublished) : null),
        [firstPublished?.getTime()],
    );

    const [from, setFrom] = useState<Date | null>(firstPublishedStart);
    const [to, setTo] = useState<Date | null>(new Date());
    const [fromError, setFromError] = useState<string | undefined>(undefined);
    const [toError, setToError] = useState<string | undefined>(undefined);

    useEffect(() => {
        setFrom(firstPublishedStart);
        setTo(new Date());
        setFromError(undefined);
        setToError(undefined);
    }, [contentId, firstPublishedStart?.getTime()]);

    const labelFrom = useI18n('widget.publishReport.dateRange.label.from');
    const labelTo = useI18n('widget.publishReport.dateRange.label.to');
    const buttonLabel = useI18n('widget.publishReport.button.text');
    const rangeInvalidMsg = useI18n('widget.publishReport.dateRange.invalid.range');
    const toInvalidMsg = useI18n('widget.publishReport.dateRange.invalid.to');
    const neverPublishedMsg = useI18n('widget.publishReport.neverPublished');
    const fromInvalidMsg = firstPublishedStart
        ? useI18n('widget.publishReport.dateRange.invalid.from', formatDate(firstPublishedStart))
        : '';

    const validationError = (() => {
        if (!from || !to) return undefined;
        const fromStart = startOfDay(from);
        const toEnd = endOfDay(to);
        const messages: string[] = [];
        if (fromStart.getTime() > toEnd.getTime()) messages.push(rangeInvalidMsg);
        if (firstPublishedStart && fromStart.getTime() < firstPublishedStart.getTime()) messages.push(fromInvalidMsg);
        if (toEnd.getTime() > today.getTime()) messages.push(toInvalidMsg);
        return messages.length > 0 ? messages.join(' , ') : undefined;
    })();

    const isValid = !!from && !!to && !fromError && !toError && !validationError;

    const rootRef = useRef<HTMLDivElement>(null);
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
    const [dialogState, setDialogState] = useState<{from: Date; to: Date} | null>(null);

    useEffect(() => {
        setPortalContainer(rootRef.current);
    }, []);

    const handleGenerate = (): void => {
        if (!from || !to) return;
        setDialogState({from: startOfDay(from), to: endOfDay(to)});
    };

    const handleDialogClose = (): void => {
        setDialogState(null);
    };

    if (!firstPublishedStart) {
        return (
            <div
                ref={rootRef}
                data-component={PUBLISH_REPORT_WIDGET_NAME}
                className={AppHelper.getCommonExtensionContainerClass()}
            >
                <div className="text-sm text-subtle">{neverPublishedMsg}</div>
            </div>
        );
    }

    const hasRangeError = !!validationError;

    return (
        <div
            ref={rootRef}
            data-component={PUBLISH_REPORT_WIDGET_NAME}
            className={`${AppHelper.getCommonExtensionContainerClass()} flex flex-col gap-4`}
        >
            <div
                className={`flex flex-col gap-3 rounded border p-3 ${hasRangeError ? 'border-error' : ''}`}
                style={hasRangeError ? undefined : {borderColor: 'transparent'}}
            >
                <DateInput
                    label={labelFrom}
                    value={from}
                    onChange={setFrom}
                    onError={setFromError}
                    error={fromError}
                    portalContainer={portalContainer}
                />
                <DateInput
                    label={labelTo}
                    value={to}
                    onChange={setTo}
                    onError={setToError}
                    error={toError}
                    portalContainer={portalContainer}
                />
                {hasRangeError && <div className="text-sm text-error">{validationError}</div>}
            </div>
            <Button
                className="self-end"
                size="sm"
                variant="outline"
                label={buttonLabel}
                disabled={!isValid}
                onClick={handleGenerate}
            />
            <PublishReportDialog
                open={!!dialogState}
                onClose={handleDialogClose}
                contentId={contentId}
                isArchived={isArchived}
                from={dialogState?.from ?? new Date()}
                to={dialogState?.to ?? new Date()}
                portalContainer={injected ? portalContainer : undefined}
                injected={injected}
            />
        </div>
    );
};

PublishReportWidget.displayName = PUBLISH_REPORT_WIDGET_NAME;
