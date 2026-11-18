import {getActiveProjectName} from '../../../shared/project';
import {requestJson} from '@enonic/ui-utils/request';
import type {LayerContentJson} from '../../../resource/json/LayerContentJson';
import {$config} from '../../../shared/config';
import {type LayerContent, toLayerContent} from '../shared/content/layerContent';
import {withParams} from './cms';

export function fetchLayers(contentId: string): Promise<LayerContent[]> {
    const url = withParams($config.get().services.layersUrl, {contentId, project: getActiveProjectName()});

    return requestJson<{projects: LayerContentJson[]}>(url).match(
        (json) => json.projects.map(toLayerContent),
        (error) => {
            throw error;
        },
    );
}
