import {LegacyElement} from '@enonic/lib-contentstudio/v6/features/shared/LegacyElement';
import type {ContentSummaryAndCompareStatus}
    from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import type {ExtensionItemViewType}
    from '@enonic/lib-contentstudio/app/view/context/ExtensionItemView';
import {useStore} from '@nanostores/preact';
import Q from 'q';
import {type ReactElement} from 'react';
import {$archiveContextContent} from '../../../../store/archive-selection';
import {PublishReportWidget} from './PublishReportWidget';

const ARCHIVE_PUBLISH_REPORT_WIDGET_NAME = 'ArchivePublishReportWidget';

export const ArchivePublishReportWidget = (): ReactElement | null => {
    const content = useStore($archiveContextContent);

    if (!content) return null;

    return (
        <PublishReportWidget
            contentId={content.getId()}
            firstPublished={content.getPublishFirstTime() ?? null}
            isArchived={true}
        />
    );
};

ArchivePublishReportWidget.displayName = ARCHIVE_PUBLISH_REPORT_WIDGET_NAME;

export class PublishReportWidgetElement
    extends LegacyElement<typeof ArchivePublishReportWidget>
    implements ExtensionItemViewType {

    constructor() {
        super({}, ArchivePublishReportWidget);
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
