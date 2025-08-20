import {Content as XPContent} from '@enonic-types/lib-content';
import {Project as XPProject} from '@enonic-types/lib-project';
import {CompareAndPublishStatusJson} from './CompareAndPublishStatusJson';

export interface LayerContentJson {
    item?: XPContent;
    compareAndPublishStatus?: CompareAndPublishStatusJson;
    project: XPProject;
}
