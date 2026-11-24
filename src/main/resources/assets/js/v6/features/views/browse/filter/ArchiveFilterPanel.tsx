import {$isContentFilterOpen, setContentFilterOpen} from '@enonic/lib-contentstudio/v6/features/search/model/contentFilter.store';
import {Button, SearchField} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {type ReactElement, useEffect, useMemo, useRef} from 'react';
import {$config} from '../../../../../shared/config';
import {i18n, useI18n} from '../../../../../shared/i18n';
import {LegacyElement} from '../../../../../shared/LegacyElement';
import type {ArchiveAggregation, ArchiveBucket} from '../../../api/archive-search';
import {
    $archiveSearch,
    $archiveSearchFacets,
    $isArchiveSearchActive,
    refreshArchiveSearchFacets,
    resetArchiveSearch,
    setArchiveSearchSelection,
    setArchiveSearchText,
} from '../../../store/archive-search';
import {ArchiveFilterSection} from './ArchiveFilterSection';

const ARCHIVE_FILTER_PANEL_NAME = 'ArchiveFilterPanel';

const LANGUAGE_SECTION = 'lang';

const PRINCIPAL_SECTIONS = new Set(['archivedBy', 'owner']);

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

function getLanguageName(tag: string): string | undefined {
    try {
        return new Intl.DisplayNames([tag], {type: 'language'}).of(tag);
    } catch {
        return undefined;
    }
}

function toDisplayName(section: string, bucket: ArchiveBucket, userKey: string): string | undefined {
    if (PRINCIPAL_SECTIONS.has(section) && bucket.key === userKey) {
        return capitalize(i18n('field.me'));
    }
    if (section === LANGUAGE_SECTION) {
        return getLanguageName(bucket.key);
    }
    return bucket.displayName;
}

// A selected bucket stays in the section when the search no longer finds anything in it.
function toSection({name, buckets}: ArchiveAggregation, selection: string[], userKey: string): ArchiveAggregation {
    const missing = selection.filter((key) => !buckets.some((bucket) => bucket.key === key));
    const all = [...buckets, ...missing.map((key) => ({key, docCount: 0}))].map((bucket) => ({
        ...bucket,
        displayName: toDisplayName(name, bucket, userKey),
    }));

    if (PRINCIPAL_SECTIONS.has(name)) {
        all.sort((a, b) => Number(b.key === userKey) - Number(a.key === userKey));
    }

    return {name, buckets: all};
}

export const ArchiveFilterPanel = (): ReactElement => {
    const {text, selection} = useStore($archiveSearch);
    const {total, aggregations} = useStore($archiveSearchFacets);
    const isActive = useStore($isArchiveSearchActive);
    const isOpen = useStore($isContentFilterOpen);
    const userKey = useStore($config).user.key;

    const inputRef = useRef<HTMLInputElement>(null);

    const searchLabel = useI18n('panel.filter.search');
    const clearLabel = useI18n('panel.filter.clear');
    const searchPlaceholder = useI18n('field.option.placeholder');
    const resultsLabel = useI18n('field.search.results', total);
    const showResultsLabel = useI18n('field.search.show.results', total);

    const sections = useMemo(
        () =>
            aggregations
                .map((aggregation) => toSection(aggregation, selection[aggregation.name] ?? [], userKey))
                .filter(({buckets}) => buckets.length > 0),
        [aggregations, selection, userKey],
    );

    useEffect(() => {
        if (isOpen) {
            void refreshArchiveSearchFacets();
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const canShowResults = isActive && total > 0;

    return (
        <div data-component={ARCHIVE_FILTER_PANEL_NAME} className="size-full overflow-y-auto bg-surface-neutral text-main px-5 py-3">
            <div className="flex justify-between items-center gap-2.5 mb-2 min-h-9">
                <h3 className="font-semibold">{searchLabel}</h3>
                {isActive && (
                    <Button
                        size="sm"
                        variant="text"
                        label={clearLabel}
                        className="underline underline-offset-4"
                        onClick={() => void resetArchiveSearch()}
                    />
                )}
            </div>

            <SearchField.Root
                className="h-11.5"
                id="ArchiveSearchInput"
                placeholder={searchPlaceholder}
                value={text}
                onChange={setArchiveSearchText}
            >
                <SearchField.Input ref={inputRef} />
                <SearchField.Clear />
            </SearchField.Root>

            <div className="flex mt-2 mb-7.5 items-center max-sm:min-h-10">
                {canShowResults && (
                    <Button
                        variant="text"
                        onClick={() => setContentFilterOpen(false)}
                        className="sm:hidden text-lg pl-4.5 pr-4.5 underline underline-offset-4"
                    >
                        {showResultsLabel}
                    </Button>
                )}
                <span className={canShowResults ? 'max-sm:hidden text-lg pl-4.5 pr-4.5' : 'text-lg pl-4.5 pr-4.5'}>
                    {resultsLabel}
                </span>
            </div>

            <div className="flex flex-col gap-7.5">
                {sections.map(({name, buckets}) => (
                    <ArchiveFilterSection
                        key={name}
                        name={name}
                        buckets={buckets}
                        selection={selection[name] ?? []}
                        onSelectionChange={(keys) => setArchiveSearchSelection(name, keys)}
                        pinnedKeys={PRINCIPAL_SECTIONS.has(name) ? [userKey] : undefined}
                    />
                ))}
            </div>
        </div>
    );
};

ArchiveFilterPanel.displayName = ARCHIVE_FILTER_PANEL_NAME;

export class ArchiveFilterPanelElement extends LegacyElement<typeof ArchiveFilterPanel> {
    constructor() {
        super({}, ArchiveFilterPanel);
    }
}
