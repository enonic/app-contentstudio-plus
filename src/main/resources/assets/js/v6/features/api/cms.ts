import {getActiveProjectName} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {$config} from '../../../shared/config';

export const CONTENT_ROOT = 'content';

export const ARCHIVE_ROOT = 'archive';

const joinPath = (...segments: string[]): string =>
    segments.filter(Boolean).join('/').replace(/(^|[^:])\/{2,}/g, '$1/');

export function getCmsRestUrl(contentRoot: string, endpoint: string): string {
    return joinPath('/', $config.get().adminUrl, 'rest-v2/cs/cms', getActiveProjectName(), contentRoot, 'content', endpoint);
}

export function withParams(url: string, params: Record<string, string | number>): string {
    const query = new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]));
    return `${url}?${query.toString()}`;
}
