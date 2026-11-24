import {Button, Checkbox, type CheckboxChecked, cn, Combobox, Listbox} from '@enonic/ui';
import {type ReactElement, useMemo, useState} from 'react';
import {useI18n} from '../../../../../shared/i18n';
import type {ArchiveBucket} from '../../../api/archive-search';

type Props = {
    name: string;
    buckets: ArchiveBucket[];
    selection: string[];
    onSelectionChange: (keys: string[]) => void;
    /** Adds a search over the buckets and keeps only these and the selected ones in sight. */
    pinnedKeys?: string[];
};

const MAX_VISIBLE_BUCKETS = 5;

const ARCHIVE_FILTER_SECTION_NAME = 'ArchiveFilterSection';

const toLabel = ({key, displayName, docCount}: ArchiveBucket): string => `${displayName ?? key} (${docCount})`;

const toId = (...parts: string[]): string => parts.join('-').replace(/[^a-zA-Z0-9_-]/g, '_');

const toggle = (keys: string[], key: string, isOn: boolean): string[] =>
    isOn ? [...keys.filter((current) => current !== key), key] : keys.filter((current) => current !== key);

const BucketList = ({name, buckets, selection, onSelectionChange}: Omit<Props, 'pinnedKeys'>): ReactElement => {
    const [showsAll, setShowsAll] = useState(false);
    const showMoreLabel = useI18n('action.show.more');
    const showLessLabel = useI18n('action.show.less');

    const visibleBuckets = showsAll ? buckets : buckets.slice(0, MAX_VISIBLE_BUCKETS);

    return (
        <>
            <div className="flex flex-col gap-2.5 px-2.5 py-2">
                {visibleBuckets.map((bucket) => (
                    <Checkbox
                        id={toId(name, bucket.key)}
                        key={bucket.key}
                        checked={selection.includes(bucket.key)}
                        label={toLabel(bucket)}
                        onCheckedChange={(checked: CheckboxChecked) =>
                            onSelectionChange(toggle(selection, bucket.key, checked === true))
                        }
                    />
                ))}
            </div>
            {buckets.length > MAX_VISIBLE_BUCKETS && (
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        variant="outline"
                        label={showsAll ? showLessLabel : showMoreLabel}
                        onClick={() => setShowsAll(!showsAll)}
                    />
                </div>
            )}
        </>
    );
};

BucketList.displayName = 'ArchiveFilterBucketList';

const SearchableBucketList = ({
    name,
    buckets,
    selection,
    onSelectionChange,
    pinnedKeys,
}: Props & {pinnedKeys: string[]}): ReactElement => {
    const [query, setQuery] = useState('');
    const searchPlaceholder = useI18n('field.option.placeholder');

    const pinnedBuckets = useMemo(
        () => buckets.filter(({key}) => pinnedKeys.includes(key) || selection.includes(key)),
        [buckets, pinnedKeys, selection],
    );

    const foundBuckets = useMemo(() => {
        const value = query.toLowerCase();
        return buckets.filter(
            ({key, displayName}) => key.toLowerCase().includes(value) || !!displayName?.toLowerCase().includes(value),
        );
    }, [buckets, query]);

    return (
        <>
            <div className="flex flex-col gap-2.5 px-2.5 py-2">
                {pinnedBuckets.map((bucket) => (
                    <Checkbox
                        id={toId(name, bucket.key, 'pinned')}
                        key={bucket.key}
                        checked={selection.includes(bucket.key)}
                        label={toLabel(bucket)}
                        onCheckedChange={(checked: CheckboxChecked) =>
                            onSelectionChange(toggle(selection, bucket.key, checked === true))
                        }
                    />
                ))}
            </div>
            <Combobox.Root
                value={query}
                onChange={setQuery}
                selectionMode="multiple"
                selection={selection}
                onSelectionChange={onSelectionChange}
            >
                <Combobox.Content>
                    <Combobox.Control>
                        <Combobox.Search>
                            <Combobox.SearchIcon />
                            <Combobox.Input placeholder={searchPlaceholder} />
                            <Combobox.Toggle />
                        </Combobox.Search>
                    </Combobox.Control>

                    <Combobox.Popup>
                        <Listbox.Content>
                            {foundBuckets.map((bucket) => {
                                const isSelected = selection.includes(bucket.key);

                                return (
                                    <Listbox.Item
                                        key={bucket.key}
                                        value={bucket.key}
                                        className={cn('h-9', isSelected && 'group')}
                                        data-tone={isSelected ? 'inverse' : ''}
                                    >
                                        <Checkbox
                                            id={toId(name, bucket.key, 'option')}
                                            checked={isSelected}
                                            label={toLabel(bucket)}
                                            tabIndex={-1}
                                            onClick={(event) => event.preventDefault()}
                                        />
                                    </Listbox.Item>
                                );
                            })}
                        </Listbox.Content>
                    </Combobox.Popup>
                </Combobox.Content>
            </Combobox.Root>
        </>
    );
};

SearchableBucketList.displayName = 'ArchiveFilterSearchableBucketList';

export const ArchiveFilterSection = ({name, buckets, selection, onSelectionChange, pinnedKeys}: Props): ReactElement => {
    const title = useI18n(`field.${name}`);

    return (
        <section data-component={ARCHIVE_FILTER_SECTION_NAME} className="relative flex flex-col">
            <h4 className="font-semibold">{title}</h4>
            {pinnedKeys ? (
                <SearchableBucketList
                    name={name}
                    buckets={buckets}
                    selection={selection}
                    onSelectionChange={onSelectionChange}
                    pinnedKeys={pinnedKeys}
                />
            ) : (
                <BucketList name={name} buckets={buckets} selection={selection} onSelectionChange={onSelectionChange} />
            )}
        </section>
    );
};

ArchiveFilterSection.displayName = ARCHIVE_FILTER_SECTION_NAME;
