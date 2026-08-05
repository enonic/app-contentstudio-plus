package com.enonic.xp.app.contentstudio.plus.widgets.layers;

import com.enonic.xp.content.CompareContentResult;
import com.enonic.xp.content.CompareContentResults;
import com.enonic.xp.content.CompareContentsParams;
import com.enonic.xp.content.CompareStatus;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.GetPublishStatusResult;
import com.enonic.xp.content.GetPublishStatusesParams;
import com.enonic.xp.content.GetPublishStatusesResult;
import com.enonic.xp.content.PublishStatus;
import com.enonic.xp.testing.ScriptRunnerSupport;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class LayersApiTest
    extends ScriptRunnerSupport
{
    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

        final ContentId contentId = ContentId.from( "abc" );

        final CompareContentResults compareResults =
            CompareContentResults.create().add( new CompareContentResult( CompareStatus.NEW, contentId ) ).build();
        when( this.contentService.compare( any( CompareContentsParams.class ) ) ).thenReturn( compareResults );

        final GetPublishStatusesResult publishStatuses =
            GetPublishStatusesResult.create().add( new GetPublishStatusResult( contentId, PublishStatus.ONLINE ) ).build();
        when( this.contentService.getPublishStatuses( any( GetPublishStatusesParams.class ) ) ).thenReturn( publishStatuses );
    }

    @Override
    public String getScriptTestFile()
    {
        return "/test/layers-test.js";
    }
}
