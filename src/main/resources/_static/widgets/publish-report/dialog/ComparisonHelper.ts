import {ContentJson} from 'lib-contentstudio/app/content/ContentJson';
import {ContentVersion} from 'lib-contentstudio/app/ContentVersion';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';

export class ComparisonHelper {

    static processContentJson(contentJson: ContentJson, version: ContentVersion): ContentJson {
        [
            '_id', 'creator', 'createdTime', 'hasChildren'
        ].forEach(e => delete contentJson[e]);

        if (ObjectHelper.isDefined(version?.getPermissions())) {
            contentJson['permissions'] = version.getPermissions().toJson();
        }

        if (ObjectHelper.isDefined(version?.isInheritPermissions())) {
            contentJson['inheritPermissions'] = version.isInheritPermissions();
        }

        return contentJson;
    }
}
