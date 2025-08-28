package com.enonic.xp.app.contentstudio.plus.widgets.layers;

import com.enonic.xp.content.CompareStatus;
import com.enonic.xp.content.PublishStatus;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class CompareStatusMapper implements MapSerializable
{
    private final CompareStatus compareStatus;

    private final PublishStatus publishStatus;

    public CompareStatusMapper( final CompareStatus compareStatus, final PublishStatus publishStatus )
    {
        this.compareStatus = compareStatus;
        this.publishStatus = publishStatus;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "compareStatus", compareStatus );
        gen.value( "publishStatus", publishStatus );
    }
}
