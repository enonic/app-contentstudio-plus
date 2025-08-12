import {ConfigObject} from '@enonic/lib-admin-ui/util/Config';

export function resolveConfig(scriptId: string): ConfigObject {
  const scriptEl: HTMLElement = document.getElementById(scriptId);
  if (!scriptEl) {
    throw Error('Could not widget config');
  }
  return JSON.parse(scriptEl.innerText) as ConfigObject;
};
