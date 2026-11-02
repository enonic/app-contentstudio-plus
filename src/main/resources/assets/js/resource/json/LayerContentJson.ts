import type {Content as XPContent} from '@enonic-types/lib-content';
import type {Project as XPProject} from '@enonic-types/lib-project';
import type {CompareAndPublishStatusJson} from './CompareAndPublishStatusJson';

export interface LayerContentJson {
    item?: XPContent | null;
    compareAndPublishStatus?: CompareAndPublishStatusJson | null;
    project: Partial<XPProject> & Pick<XPProject, 'id'>;
}
