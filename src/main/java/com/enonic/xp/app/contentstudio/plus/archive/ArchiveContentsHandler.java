package com.enonic.xp.app.contentstudio.plus.archive;

import java.time.Instant;
import java.util.HashSet;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

import com.enonic.xp.aggregation.Aggregation;
import com.enonic.xp.aggregation.Aggregations;
import com.enonic.xp.aggregation.BucketAggregation;
import com.enonic.xp.archive.ArchiveConstants;

import com.enonic.xp.attachment.Attachment;
import com.enonic.xp.attachment.AttachmentNames;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentIds;
import com.enonic.xp.content.ContentPublishInfo;
import com.enonic.xp.content.ContentQuery;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.Contents;
import com.enonic.xp.content.GetContentByIdsParams;
import com.enonic.xp.data.ValueFactory;
import com.enonic.xp.query.aggregation.TermsAggregationQuery;
import com.enonic.xp.query.filter.ValueFilter;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class ArchiveContentsHandler
    implements ScriptBean
{
    private static final String SOURCE_LABEL = "source";

    private static final String ROOT = ArchiveConstants.ARCHIVE_ROOT_PATH.toString();

    private static final String PARENT_PATH = "_parentPath";

    private static final String PARENTS = "parents";

    private ContentService contentService;

    private String[] ids = {};

    public void setIds( final String ids )
    {
        this.ids = ids == null || ids.isBlank() ? new String[0] : ids.split( "," );
    }

    public MapSerializable getByIds()
    {
        final Contents contents = ids.length == 0
            ? Contents.empty()
            : contentService.getByIds( GetContentByIdsParams.create().contentIds( ContentIds.from( ids ) ).build() );

        final Set<String> parents = findParents( contents );

        return gen -> serialize( gen, contents, parents );
    }

    public MapSerializable getDescendantIds()
    {
        final Contents contents = ids.length == 0
            ? Contents.empty()
            : contentService.getByIds( GetContentByIdsParams.create().contentIds( ContentIds.from( ids ) ).build() );
        final ContentIds descendants = ArchiveDescendants.findIds( contentService, contents.getPaths() );

        return gen -> {
            gen.array( "ids" );
            descendants.forEach( id -> gen.value( id.toString() ) );
            gen.end();
        };
    }

    private void serialize( final MapGenerator gen, final Contents contents, final Set<String> parents )
    {
        gen.array( "items" );
        contents.forEach( content -> {
            gen.map();
            serialize( gen, content, parents.contains( toParentKey( content ) ) );
            gen.end();
        } );
        gen.end();
    }

    private void serialize( final MapGenerator gen, final Content content, final boolean hasChildren )
    {
        gen.value( "id", content.getId().toString() );
        gen.value( "name", content.getName().toString() );
        gen.value( "displayName", content.getDisplayName() );
        gen.value( "path", content.getPath().toString() );
        gen.value( "type", content.getType().toString() );
        gen.value( "hasChildren", hasChildren );
        gen.value( "isValid", content.isValid() );
        gen.value( "isPage", content.getPage() != null );
        gen.value( "isImage", isImage( content ) );
        gen.value( "editable", true );
        gen.value( "deletable", true );
        gen.value( "language", content.getLanguage() == null ? null : content.getLanguage().toLanguageTag() );
        gen.value( "owner", Objects.toString( content.getOwner(), null ) );
        gen.value( "creator", Objects.toString( content.getCreator(), null ) );
        gen.value( "modifier", Objects.toString( content.getModifier(), null ) );
        gen.value( "createdTime", toString( content.getCreatedTime() ) );
        gen.value( "modifiedTime", toString( content.getModifiedTime() ) );
        gen.value( "archivedTime", toString( content.getArchivedTime() ) );
        gen.value( "archivedBy", Objects.toString( content.getArchivedBy(), null ) );
        gen.value( "originalParentPath", Objects.toString( content.getOriginalParentPath(), null ) );
        gen.value( "originalName", Objects.toString( content.getOriginalName(), null ) );
        gen.value( "originProject", Objects.toString( content.getOriginProject(), null ) );
        gen.value( "variantOf", Objects.toString( content.getVariantOf(), null ) );

        gen.array( "inherit" );
        content.getInherit().stream().sorted().forEach( type -> gen.value( type.toString() ) );
        gen.end();

        gen.map( "childOrder" );
        gen.array( "orderExpressions" );
        gen.end();
        gen.end();

        gen.array( "attachments" );
        content.getAttachments().forEach( attachment -> gen.value( attachment.getName() ) );
        gen.end();

        final Attachment thumbnail = content.getAttachments().byName( AttachmentNames.THUMBNAIL );
        if ( thumbnail != null )
        {
            gen.map( "thumbnail" );
            gen.value( "binaryReference", thumbnail.getBinaryReference().toString() );
            gen.value( "mimeType", thumbnail.getMimeType() );
            gen.value( "size", thumbnail.getSize() );
            gen.end();
        }

        final ContentPublishInfo publish = content.getPublishInfo();
        if ( publish != null )
        {
            gen.map( "publish" );
            gen.value( "from", toString( publish.from() ) );
            gen.value( "to", toString( publish.to() ) );
            gen.value( "first", toString( publish.first() ) );
            gen.value( "time", toString( publish.time() ) );
            gen.end();
        }

        if ( content.getWorkflowInfo() != null )
        {
            gen.map( "workflow" );
            gen.value( "state", Objects.toString( content.getWorkflowInfo().getState(), null ) );
            gen.end();
        }
    }

    private Set<String> findParents( final Contents contents )
    {
        if ( contents.isEmpty() )
        {
            return Set.of();
        }

        final ValueFilter.Builder filter = ValueFilter.create().fieldName( PARENT_PATH );
        contents.forEach( content -> filter.addValue( ValueFactory.newString( ROOT + content.getPath() ) ) );

        final ContentQuery query = ContentQuery.create()
            .size( 0 )
            .queryFilter( filter.build() )
            .aggregationQuery( TermsAggregationQuery.create( PARENTS ).fieldName( PARENT_PATH ).size( contents.getSize() ).build() )
            .build();

        final Aggregations aggregations = contentService.find( query ).getAggregations();
        final Aggregation parents = aggregations == null ? null : aggregations.get( PARENTS );

        if ( !( parents instanceof final BucketAggregation buckets ) )
        {
            return Set.of();
        }

        final Set<String> result = new HashSet<>();
        buckets.getBuckets().forEach( bucket -> {
            if ( bucket.getDocCount() > 0 )
            {
                result.add( bucket.getKey().toLowerCase( Locale.ROOT ) );
            }
        } );
        return result;
    }

    private static String toParentKey( final Content content )
    {
        return ( ROOT + content.getPath() ).toLowerCase( Locale.ROOT );
    }

    private static boolean isImage( final Content content )
    {
        return ( content.getType().isImageMedia() || content.getType().isVectorMedia() ) &&
            content.getAttachments().byLabel( SOURCE_LABEL ) != null;
    }

    private static String toString( final Instant instant )
    {
        return instant == null ? null : instant.toString();
    }

    @Override
    public void initialize( final BeanContext context )
    {
        contentService = context.getService( ContentService.class ).get();
    }
}
