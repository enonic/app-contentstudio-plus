import {ContentJson} from 'lib-contentstudio/app/content/ContentJson';

export class ComparisonHelper {

    static processContentJson(contentJson: ContentJson): ContentJson {
        [
            'hasChildren',
        ].forEach(e => delete contentJson[e]);

        return contentJson;
    }
}
