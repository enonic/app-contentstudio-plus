import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';

interface ItemWithPath {
    getPath(): ContentPath;
}

export abstract class ArchiveHelper {

    public static filterTopMostItems(items: ItemWithPath[]): ItemWithPath[]  {
        const result: ItemWithPath[] = [];

        items.forEach((thisItem: ItemWithPath) => {
            const contains: boolean = result.some((otherItem: ItemWithPath, index: number) => {
                if (thisItem.getPath().isDescendantOf(otherItem.getPath())) {
                    return true;
                }

                if (otherItem.getPath().isDescendantOf(thisItem.getPath())) {
                    result[index] = thisItem;
                    return true;
                }

                return false;
            });

            if (!contains) {
                result.push(thisItem);
            }
        });

        return result;
    }
}
