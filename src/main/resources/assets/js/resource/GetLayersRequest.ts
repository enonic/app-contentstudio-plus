import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {ResourceRequest} from '@enonic/lib-admin-ui/rest/ResourceRequest';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {LayerContent} from '../widgets/layers/LayerContent';
import {LayerContentJson} from './json/LayerContentJson';

export class GetLayersRequest
    extends ResourceRequest<LayerContent[]> {

    private readonly contentId: ContentId;

    constructor(contentId: ContentId) {
        super();

        this.contentId = contentId;
    }

    getParams(): object {
        return {
            contentId: this.contentId.toString(),
        };
    }

    getRequestPath(): Path {
        return Path.fromString(CONFIG.getString('services.layersUrl'));
    }

    protected parseResponse(response: JsonResponse<LayerContentJson[]>): LayerContent[] {
        return response.getResult()['projects'].map(LayerContent.fromJson);
    }
}
