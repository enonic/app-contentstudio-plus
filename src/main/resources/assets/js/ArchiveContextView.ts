import {List} from 'lucide-react';
import Q from 'q';
import {Extension} from '@enonic/lib-admin-ui/extension/Extension';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContextView} from '@enonic/lib-contentstudio/app/view/context/ContextView';
import {ExtensionView, InternalExtensionType} from '@enonic/lib-contentstudio/app/view/context/ExtensionView';
import {ArchiveDetailsWidgetElement}
    from './v6/features/views/context/widget/details/ArchiveDetailsWidget';

export class ArchiveContextView
    extends ContextView {

    private static allowedExtensionIds: string[] = ['publish-report'];

    constructor() {
        super();
        this.addClass('archive-context-view');
    }

    protected getInitialExtensions(): ExtensionView[] {
        const appId = CONFIG.getString('appId');
        this.extensionPropertiesView = ExtensionView.create()
            .setExtension(Extension.create().setExtensionDescriptorKey(`${appId}:details`).build())
            .setName(i18n('field.contextPanel.details'))
            .setDescription(i18n('field.contextPanel.details.description'))
            .setExtensionClass('properties-widget')
            .setIconClass('icon-list')
            .setIcon(List)
            .setType(InternalExtensionType.INFO)
            .setContextView(this)
            .addExtensionItemView(new ArchiveDetailsWidgetElement())
            .build();

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
