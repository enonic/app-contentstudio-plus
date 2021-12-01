import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';

interface ItemWithPath {
    getPath(): ContentPath;
}

export abstract class ArchiveHelper {

    public static filterTopMostItems(items: ItemWithPath[]): ItemWithPath[]  {
        const result: ItemWithPath[] = [];

        items.forEach((item: ItemWithPath) => {
            const contains: boolean = result.some((itemToDelete: ItemWithPath, index: number) => {
                if (item.getPath().isDescendantOf(itemToDelete.getPath())) {
                    return true;
                }

                if (itemToDelete.getPath().isDescendantOf(item.getPath())) {
                    result[index] = item;
                    return true;
                }

                return false;
            });

            if (!contains) {
                result.push(item);
            }
        });

        return result;
    }
}
