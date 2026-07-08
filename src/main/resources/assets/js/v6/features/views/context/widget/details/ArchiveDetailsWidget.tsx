import {useStore} from '@nanostores/preact';
import Q from 'q';
import type {ReactElement} from 'react';
import type {ContentSummaryAndCompareStatus}
    from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import type {ExtensionItemViewType}
    from '@enonic/lib-contentstudio/app/view/context/ExtensionItemView';
import {LegacyElement} from '@enonic/lib-contentstudio/v6/shared/ui/LegacyElement';
import {$activeWidgetId, $isContextOpen} from '@enonic/lib-contentstudio/v6/widgets/context-panel/model/contextWidgets.store';
import {getDetailsWidgetKey} from '@enonic/lib-contentstudio/v6/shared/lib/widget/details';
import {$archiveContextContent} from '../../../../store/archive-selection';
import {ArchiveDetailsWidgetAttachmentsSection} from './ArchiveDetailsWidgetAttachmentsSection';
import {ArchiveDetailsWidgetContentSection} from './ArchiveDetailsWidgetContentSection';
import {ArchiveDetailsWidgetInfoSection} from './ArchiveDetailsWidgetInfoSection';

const ARCHIVE_DETAILS_WIDGET_NAME = 'ArchiveDetailsWidget';

export const ArchiveDetailsWidget = (): ReactElement | null => {
    const isContextOpen = useStore($isContextOpen);
    const activeWidget = useStore($activeWidgetId);
    const isActiveWidget = activeWidget === getDetailsWidgetKey();
    const content = useStore($archiveContextContent);

    if (!isContextOpen || !isActiveWidget || !content) return null;

    return (
        <div data-component={ARCHIVE_DETAILS_WIDGET_NAME} className="flex flex-col gap-7.5">
            <ArchiveDetailsWidgetContentSection />
            <ArchiveDetailsWidgetInfoSection />
            <ArchiveDetailsWidgetAttachmentsSection />
        </div>
    );
};

ArchiveDetailsWidget.displayName = ARCHIVE_DETAILS_WIDGET_NAME;

export class ArchiveDetailsWidgetElement
    extends LegacyElement<typeof ArchiveDetailsWidget>
    implements ExtensionItemViewType {

    constructor() {
        super({}, ArchiveDetailsWidget);
    }

    public layout(): Q.Promise<void> {
        return Q();
    }

    public setContentAndUpdateView(_item: ContentSummaryAndCompareStatus): Q.Promise<null | void> {
        return Q();
    }

    public fetchExtensionContents(_url: string, _contentId: string): Q.Promise<void> {
        return Q();
    }

    public hide(): void {
        return;
    }

    public show(): void {
        return;
    }
}
