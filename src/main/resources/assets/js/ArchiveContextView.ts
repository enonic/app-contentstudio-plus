import {Extension} from '@enonic/lib-admin-ui/extension/Extension';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {ContextView} from '@enonic/lib-contentstudio/app/view/context/ContextView';
import {ExtensionView} from '@enonic/lib-contentstudio/app/view/context/ExtensionView';
import Q from 'q';

export class ArchiveContextView
    extends ContextView {

    private static allowedExtensionIds: string[] = ['publish-report'];

    constructor() {
        super();
        this.addClass('archive-context-view');
    }

    protected getInitialExtensions(): ExtensionView[] {
        return [this.extensionPropertiesView, this.extensionVersionsView];
    }

    protected fetchCustomExtensionViews(): Q.Promise<Extension[]> {
        const appId = CONFIG.getString('appId');
        const allowedKeys = ArchiveContextView.allowedExtensionIds.map((id: string) =>
            id.split(':').length === 2 ? id : `${appId}:${id}`,
        );

        return super.fetchCustomExtensionViews().then((extensions: Extension[]) =>
            extensions.filter((extension: Extension) => allowedKeys.indexOf(extension.getDescriptorKey().toString()) > -1),
        );
    }
}
