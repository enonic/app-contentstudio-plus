package com.enonic.xp.app.contentstudio.plus.widgets.layers;

import com.enonic.xp.content.CompareContentResult;
import com.enonic.xp.content.CompareContentsParams;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentIds;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.GetPublishStatusResult;
import com.enonic.xp.content.GetPublishStatusesParams;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class CompareStatusHandler implements ScriptBean
{

    private ContentId contentId;

    private ContentService contentService;

    public CompareStatusMapper getCompareStatus( )
    {
        final ContentIds contentIds = ContentIds.from( this.contentId );
        final CompareContentResult compareResult =
            contentService.compare( CompareContentsParams.create().contentIds( contentIds ).build() ).iterator().next();
        final GetPublishStatusResult getPublishStatusResult =
            contentService.getPublishStatuses( GetPublishStatusesParams.create().contentIds( contentIds ).build() ).iterator().next();

        return new CompareStatusMapper( compareResult.getCompareStatus(), getPublishStatusResult.getPublishStatus() );
    }

    public void setContentId( final String contentId )
    {
        this.contentId = ContentId.from(  contentId );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        contentService = context.getService( ContentService.class ).get();
    }
}
