package com.enonic.xp.app.contentstudio.plus.archive;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Set;

import com.google.common.io.ByteSource;

import com.enonic.xp.attachment.Attachment;
import com.enonic.xp.attachment.AttachmentNames;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentNotFoundException;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.Media;
import com.enonic.xp.image.ImageService;
import com.enonic.xp.image.ReadImageParams;
import com.enonic.xp.media.ImageOrientation;
import com.enonic.xp.media.MediaInfoService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class ArchiveIconHandler
    implements ScriptBean
{
    private static final int QUALITY = 85;

    private static final String IMAGE_PREFIX = "image/";

    private static final String SVG_MIME_TYPE = "image/svg+xml";

    private static final String SVGZ_EXTENSION = "svgz";

    private static final Set<String> UNSCALED_MIME_TYPES = Set.of( "image/webp", "image/avif", "image/gif", SVG_MIME_TYPE );

    private ContentService contentService;

    private ImageService imageService;

    private MediaInfoService mediaInfoService;

    private String contentId;

    private int size;

    private String mimeType;

    private ByteSource data;

    private boolean gzipped;

    public void setContentId( final String contentId )
    {
        this.contentId = contentId;
    }

    public void setSize( final int size )
    {
        this.size = size;
    }

    public boolean load()
    {
        final Content content = getContent();
        if ( content == null )
        {
            return false;
        }

        final Attachment thumbnail = content.getAttachments().byName( AttachmentNames.THUMBNAIL );
        final Media image = thumbnail == null ? asImage( content ) : null;
        final Attachment attachment = thumbnail != null ? thumbnail : image == null ? null : image.getSourceAttachment();

        if ( attachment == null )
        {
            return false;
        }

        final boolean isSvgz = SVGZ_EXTENSION.equals( attachment.getExtension() );
        final String type = isSvgz ? SVG_MIME_TYPE : attachment.getMimeType();

        if ( type == null || !type.startsWith( IMAGE_PREFIX ) )
        {
            return false;
        }

        final ByteSource source = contentService.getBinary( content.getId(), attachment.getBinaryReference() );
        if ( source == null )
        {
            return false;
        }

        this.mimeType = type;
        this.gzipped = isSvgz;
        this.data = UNSCALED_MIME_TYPES.contains( type ) ? source : scale( content, attachment, image, source );

        return true;
    }

    public String getMimeType()
    {
        return mimeType;
    }

    public ByteSource getData()
    {
        return data;
    }

    public boolean isGzipped()
    {
        return gzipped;
    }

    private ByteSource scale( final Content content, final Attachment attachment, final Media image, final ByteSource source )
    {
        final ImageOrientation orientation = image == null ? mediaInfoService.getImageOrientation( source ) : image.getOrientation();

        final ReadImageParams params = ReadImageParams.newImageParams()
            .contentId( content.getId() )
            .binaryReference( attachment.getBinaryReference() )
            .cropping( image == null ? null : image.getCropping() )
            .scaleSize( size )
            .scaleSquare( false )
            .mimeType( attachment.getMimeType() )
            .quality( QUALITY )
            .orientation( orientation )
            .build();

        try
        {
            return imageService.readImage( params );
        }
        catch ( IOException e )
        {
            throw new UncheckedIOException( e );
        }
    }

    private Content getContent()
    {
        try
        {
            return contentService.getById( ContentId.from( contentId ) );
        }
        catch ( ContentNotFoundException e )
        {
            return null;
        }
    }

    private static Media asImage( final Content content )
    {
        final boolean isImage = content.getType().isImageMedia() || content.getType().isVectorMedia();
        return isImage && content instanceof final Media media ? media : null;
    }

    @Override
    public void initialize( final BeanContext context )
    {
        contentService = context.getService( ContentService.class ).get();
        imageService = context.getService( ImageService.class ).get();
        mediaInfoService = context.getService( MediaInfoService.class ).get();
    }
}
