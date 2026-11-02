import type {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {i18n} from '../../../../shared/i18n';

export type ContentDisplaySource = {
    displayName: string;
    name: string;
    path: string;
    type: string;
};

export type ContentDisplay = {
    displayName: string;
    pathString: string;
};

const UNNAMED_PREFIX = '__unnamed__';

const capitalizeAll = (value: string): string => value.replace(/(?:^|\s)\S/g, ch => ch.toUpperCase());

const localName = (type: string): string => type.slice(type.indexOf(':') + 1);

const prettifyUnnamed = (name?: string): string => {
    const unnamed = i18n('field.unnamed');
    if (!name) {
        return `<${unnamed}>`;
    }
    return `<${capitalizeAll(`${unnamed} ${name.replace(/-/g, ' ').trim()}`)}>`;
};

const parentPath = (path: string): string => {
    const index = path.lastIndexOf('/');
    return index <= 0 ? '/' : path.slice(0, index);
};

const joinPath = (parent: string, name: string): string => (parent.endsWith('/') ? `${parent}${name}` : `${parent}/${name}`);

export const resolveContentDisplay = (source: ContentDisplaySource): ContentDisplay => {
    const isUnnamed = source.name.startsWith(UNNAMED_PREFIX);

    const displayName = source.displayName || prettifyUnnamed(localName(source.type));

    const pathString = isUnnamed ? joinPath(parentPath(source.path), prettifyUnnamed()) : source.path;

    return {displayName, pathString};
};

export const contentDisplayOf = (content: ContentSummaryAndCompareStatus): ContentDisplaySource => {
    const summary = content.getContentSummary();
    return {
        displayName: content.getDisplayName(),
        name: summary.getName().toString(),
        path: summary.getPath().toString(),
        type: summary.getType().toString(),
    };
};
