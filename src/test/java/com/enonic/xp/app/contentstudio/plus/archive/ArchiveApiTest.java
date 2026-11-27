package com.enonic.xp.app.contentstudio.plus.archive;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.mockito.Mockito;

import com.enonic.xp.aggregation.Aggregations;
import com.enonic.xp.aggregation.Bucket;
import com.enonic.xp.aggregation.BucketAggregation;
import com.enonic.xp.aggregation.Buckets;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.archive.RestoreContentException;
import com.enonic.xp.archive.RestoreContentParams;
import com.enonic.xp.archive.RestoreContentsResult;
import com.enonic.xp.attachment.Attachment;
import com.enonic.xp.attachment.AttachmentNames;
import com.enonic.xp.attachment.Attachments;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentIds;
import com.enonic.xp.content.ContentName;
import com.enonic.xp.content.ContentNotFoundException;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentPublishInfo;
import com.enonic.xp.content.Contents;
import com.enonic.xp.content.DeleteContentParams;
import com.enonic.xp.content.DeleteContentsResult;
import com.enonic.xp.content.ContentQuery;
import com.enonic.xp.content.FindContentIdsByQueryResult;
import com.enonic.xp.content.GetContentByIdsParams;
import com.enonic.xp.content.Media;
import com.enonic.xp.content.WorkflowInfo;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;
import com.enonic.xp.schema.content.ContentType;
import com.enonic.xp.schema.content.ContentTypeName;
import com.enonic.xp.schema.content.ContentTypeService;
import com.enonic.xp.schema.content.ContentTypes;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.task.ProgressReportParams;
import com.enonic.xp.task.ProgressReporter;
import com.enonic.xp.task.SubmitLocalTaskParams;
import com.enonic.xp.task.TaskId;
import com.enonic.xp.task.TaskService;
import com.enonic.xp.testing.ScriptRunnerSupport;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;

public class ArchiveApiTest
    extends ScriptRunnerSupport
{
    private static final PrincipalKey USER = PrincipalKey.from( "user:system:known" );

    private static final ContentPath FOLDER_PATH = ContentPath.from( "/folder-a" );

    private static final List<String> TASK_REPORTS = new ArrayList<>();

    public static class TaskProbe
    {
        public String takeReports()
        {
            final String reports = String.join( "\n", TASK_REPORTS );
            TASK_REPORTS.clear();
            return reports;
        }
    }

    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

        mockContentTypes();
        mockContents();
        mockTasks();
    }

    private void mockTasks()
    {
        final ProgressReporter reporter = Mockito.mock( ProgressReporter.class );
        doAnswer( invocation -> {
            final ProgressReportParams params = invocation.getArgument( 0 );
            return TASK_REPORTS.add( params.getMessage() != null ? params.getMessage() : params.getCurrent() + "/" + params.getTotal() );
        } ).when( reporter ).progress( any( ProgressReportParams.class ) );

        final TaskService taskService = Mockito.mock( TaskService.class );
        when( taskService.submitLocalTask( any( SubmitLocalTaskParams.class ) ) ).thenAnswer( invocation -> {
            final SubmitLocalTaskParams params = invocation.getArgument( 0 );
            final TaskId taskId = TaskId.from( "task-1" );
            TASK_REPORTS.add( params.getDescription() );
            params.getRunnableTask().run( taskId, reporter );
            return taskId;
        } );

        addService( TaskService.class, taskService );

        when( this.contentService.restore( any( RestoreContentParams.class ) ) ).thenAnswer( invocation -> {
            final RestoreContentParams params = invocation.getArgument( 0 );
            if ( "d".equals( params.getContentId().toString() ) )
            {
                throw new RestoreContentException( "Cannot restore", ContentPath.from( "/note-d" ) );
            }
            params.getRestoreContentListener().contentRestored( 1 );
            return RestoreContentsResult.create().addRestored( params.getContentId() ).parentPath( ContentPath.ROOT ).build();
        } );

        when( this.contentService.delete( any( DeleteContentParams.class ) ) ).thenAnswer( invocation -> {
            final DeleteContentParams params = invocation.getArgument( 0 );
            params.getDeleteContentListener().contentDeleted( 1 );
            return DeleteContentsResult.create().addDeleted( ContentId.from( params.getContentPath().getName().toString() ) ).build();
        } );
    }

    private void mockContentTypes()
    {
        final ContentType article = ContentType.create()
            .name( "myapp:Article" )
            .superType( ContentTypeName.structured() )
            .title( "Article" )
            .titleI18nKey( "article.title" )
            .build();

        final ContentType note = ContentType.create().name( "myapp:note" ).superType( ContentTypeName.structured() ).title( "Note" ).build();

        final ContentTypeService contentTypeService = Mockito.mock( ContentTypeService.class );
        when( contentTypeService.getAll() ).thenReturn( ContentTypes.from( article, note ) );

        final MessageBundle bundle = Mockito.mock( MessageBundle.class );
        when( bundle.localize( "article.title" ) ).thenReturn( "Artikkel" );

        final Locale norwegian = Locale.forLanguageTag( "no" );
        final LocaleService localeService = Mockito.mock( LocaleService.class );
        when( localeService.getSupportedLocale( anyList(), any( ApplicationKey.class ) ) ).thenReturn( norwegian );
        when( localeService.getBundle( any( ApplicationKey.class ), any( Locale.class ) ) ).thenReturn( bundle );

        addService( ContentTypeService.class, contentTypeService );
        addService( LocaleService.class, localeService );
    }

    private void mockContents()
        throws Exception
    {
        final Content folder = Content.create()
            .id( ContentId.from( "a" ) )
            .name( "folder-a" )
            .parentPath( ContentPath.ROOT )
            .displayName( "Folder A" )
            .type( ContentTypeName.folder() )
            .valid( true )
            .language( Locale.forLanguageTag( "no" ) )
            .owner( USER )
            .creator( USER )
            .modifier( USER )
            .createdTime( Instant.parse( "2026-01-01T10:00:00Z" ) )
            .modifiedTime( Instant.parse( "2026-01-02T10:00:00Z" ) )
            .archivedTime( Instant.parse( "2026-01-03T10:00:00Z" ) )
            .archivedBy( USER )
            .originalParentPath( ContentPath.from( "/site" ) )
            .originalName( ContentName.from( "folder-original" ) )
            .workflowInfo( WorkflowInfo.ready() )
            .publishInfo( ContentPublishInfo.create().first( Instant.parse( "2026-01-01T12:00:00Z" ) ).build() )
            .build();

        final Content article = Content.create()
            .id( ContentId.from( "b" ) )
            .name( "article-b" )
            .parentPath( FOLDER_PATH )
            .displayName( "Article B" )
            .type( ContentTypeName.from( "myapp:article" ) )
            .valid( false )
            .modifiedTime( Instant.parse( "2026-01-02T10:00:00Z" ) )
            .attachments( Attachments.from(
                Attachment.create().name( AttachmentNames.THUMBNAIL ).mimeType( "image/png" ).size( 12 ).build() ) )
            .build();

        final Content image = Media.create()
            .id( ContentId.from( "c" ) )
            .name( "image-c.png" )
            .parentPath( ContentPath.ROOT )
            .displayName( "Image C" )
            .type( ContentTypeName.imageMedia() )
            .valid( true )
            .attachments(
                Attachments.from( Attachment.create().name( "image-c.png" ).label( "source" ).mimeType( "image/png" ).size( 34 ).build() ) )
            .build();

        final Content note = Content.create()
            .id( ContentId.from( "d" ) )
            .name( "note-d" )
            .parentPath( ContentPath.ROOT )
            .displayName( "Note D" )
            .type( ContentTypeName.from( "myapp:note" ) )
            .valid( true )
            .build();

        final List<Content> all = List.of( folder, article, image, note );

        when( this.contentService.find( any( ContentQuery.class ) ) ).thenAnswer( invocation -> {
            final ContentQuery query = invocation.getArgument( 0 );
            if ( !query.getAggregationQueries().isEmpty() )
            {
                final Bucket withChildren = Bucket.create().key( "/archive/Folder-A" ).docCount( 1 ).build();
                final Bucket withoutChildren = Bucket.create().key( "/archive/note-d" ).docCount( 0 ).build();
                return FindContentIdsByQueryResult.create()
                    .contents( ContentIds.empty() )
                    .aggregations( Aggregations.from( BucketAggregation.bucketAggregation( "parents" )
                                                          .buckets( Buckets.create().add( withChildren ).add( withoutChildren ).build() )
                                                          .build() ) )
                    .build();
            }
            if ( query.getQueryExpr() != null )
            {
                final boolean ofFolder = query.getQueryExpr().toString().contains( "/archive/folder-a/*" );
                return FindContentIdsByQueryResult.create()
                    .contents( ofFolder && query.getSize() != 0 ? ContentIds.from( "b" ) : ContentIds.empty() )
                    .totalHits( ofFolder ? 1 : 0 )
                    .build();
            }
            return FindContentIdsByQueryResult.create()
                .contents( ContentIds.empty() )
                .totalHits( FOLDER_PATH.equals( query.getParentPath() ) ? 1 : 0 )
                .build();
        } );

        when( this.contentService.getById( any( ContentId.class ) ) ).thenAnswer( invocation -> {
            final ContentId id = invocation.getArgument( 0 );
            return all.stream()
                .filter( content -> content.getId().equals( id ) )
                .findFirst()
                .orElseThrow( () -> ContentNotFoundException.create().contentId( id ).build() );
        } );

        when( this.contentService.getByIds( any( GetContentByIdsParams.class ) ) ).thenAnswer( invocation -> {
            final GetContentByIdsParams params = invocation.getArgument( 0 );
            return all.stream().filter( content -> params.getIds().contains( content.getId() ) ).collect( Contents.collector() );
        } );
    }

    @Override
    public String getScriptTestFile()
    {
        return "/test/archive-test.js";
    }
}
