import {i18n} from '../../../../shared/i18n';
import {joinPath, parentPath} from './contentPath';

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

export const resolveContentDisplay = (source: ContentDisplaySource): ContentDisplay => {
    const isUnnamed = source.name.startsWith(UNNAMED_PREFIX);

    const displayName = source.displayName || prettifyUnnamed(localName(source.type));

    const pathString = isUnnamed ? joinPath(parentPath(source.path), prettifyUnnamed()) : source.path;

    return {displayName, pathString};
};
