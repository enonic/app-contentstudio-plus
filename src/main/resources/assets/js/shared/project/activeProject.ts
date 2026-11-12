import {atom} from 'nanostores';

export const $activeProject = atom<string>('');

export const getActiveProjectName = (): string => $activeProject.get();

export function setActiveProject(projectName: string | null | undefined): void {
    $activeProject.set(projectName ?? '');
}
