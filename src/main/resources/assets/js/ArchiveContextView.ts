import {ContextView} from '@enonic/lib-contentstudio/app/view/context/ContextView';
import Q from 'q';
import {Extension} from '@enonic/lib-admin-ui/extension/Extension';
import {ExtensionView} from '@enonic/lib-contentstudio/app/view/context/ExtensionView';
import {ExtensionItemView} from '@enonic/lib-contentstudio/app/view/context/ExtensionItemView';
import {ExtensionAttachmentsItemView} from '@enonic/lib-contentstudio/app/view/context/extension/details/ExtensionAttachmentsItemView';
import {ContentPath} from '@enonic/lib-contentstudio/app/content/ContentPath';
import {ExtensionArchiveStatusItemView} from './extension/ExtensionArchiveStatusItemView';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ExtensionArchivePropertiesItemView} from './extension/ExtensionArchivePropertiesItemView';
import {ExtensionArchiveItemView} from './extension/ExtensionArchiveItemView';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

export class ArchiveContextView
    extends ContextView {

    private static allowedExtensionIds = ['publish-report'];

    private archiveExtensionItemView: ExtensionArchiveItemView;

    private propertiesExtensionItemView: ExtensionArchivePropertiesItemView;

    constructor() {
        super();
        this.addClass('archive-context-view');
    }

    protected fetchCustomExtensions(): Q.Promise<Extension[]> {
        const appId = CONFIG.getString('appId');
        const allowedExtensionIds = ArchiveContextView.allowedExtensionIds.map((extensionId: string) =>
            // If allowed widgetId is missing appId, assume it's from the Content Studio+ app
            extensionId.split(':').length == 2 ? extensionId : `${appId}:${extensionId}`
        );
        const allowedExtensions = super.fetchCustomExtensions().then((extensions: Extension[]) =>
            extensions.filter((extension: Extension) => allowedExtensionIds.indexOf(extension.getDescriptorKey().toString()) > -1)
        );

        return Q(allowedExtensions);
    }

    setArchiveItem(item: ArchiveContentViewItem): void {
        if (item) {
            this.archiveExtensionItemView.whenRendered(() => {
                this.archiveExtensionItemView.setSubName(item.getOriginalFullPath());
            });
        }
    }

    protected getInitialExtensions(): ExtensionView[] {
        return [this.extensionPropertiesView, this.createExtensionVersionsView()];
    }

    protected getExtensionDetailsItemViews(): ExtensionItemView[] {
        this.archiveExtensionItemView = new ExtensionArchiveItemView();
        this.propertiesExtensionItemView = new ExtensionArchivePropertiesItemView();

        return [
            this.archiveExtensionItemView,
            new ExtensionArchiveStatusItemView(),
            this.propertiesExtensionItemView,
            new ExtensionAttachmentsItemView().setContentRootPath(ContentPath.ARCHIVE_ROOT),
        ];
    }
}
