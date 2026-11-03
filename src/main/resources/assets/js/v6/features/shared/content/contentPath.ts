export const parentPath = (path: string): string => {
    const index = path.lastIndexOf('/');
    return index <= 0 ? '/' : path.slice(0, index);
};

export const pathName = (path: string): string => path.slice(path.lastIndexOf('/') + 1);

export const joinPath = (parent: string, name: string): string =>
    parent.endsWith('/') ? `${parent}${name}` : `${parent}/${name}`;
