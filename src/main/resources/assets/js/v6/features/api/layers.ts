import {getActiveProjectName} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {requestJson} from '@enonic/ui-utils/request';
import {LayerContent} from '../../../extension/layers/LayerContent';
import type {LayerContentJson} from '../../../resource/json/LayerContentJson';
import {$config} from '../../../shared/config';
import {withParams} from './cms';

export function fetchLayers(contentId: string): Promise<LayerContent[]> {
    const url = withParams($config.get().services.layersUrl, {contentId, project: getActiveProjectName()});

    return requestJson<{projects: LayerContentJson[]}>(url).match(
        (json) => json.projects.map(LayerContent.fromJson),
        (error) => {
            throw error;
        },
    );
}
