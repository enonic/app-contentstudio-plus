package com.enonic.xp.app.contentstudio.plus.archive;

import java.util.Comparator;
import java.util.List;

import com.enonic.xp.archive.RestoreContentException;
import com.enonic.xp.archive.RestoreContentParams;
import com.enonic.xp.branch.Branch;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentIds;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentPaths;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.Contents;
import com.enonic.xp.content.DeleteContentParams;
import com.enonic.xp.content.GetContentByIdsParams;
import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.task.ProgressReportParams;
import com.enonic.xp.task.ProgressReporter;
import com.enonic.xp.task.RunnableTask;
import com.enonic.xp.task.SubmitLocalTaskParams;
import com.enonic.xp.task.TaskService;

public class ArchiveTaskHandler
    implements ScriptBean
{
    private static final Branch MASTER = Branch.from( "master" );

    private ContentService contentService;

    private TaskService taskService;

    private ContentIds ids = ContentIds.empty();

    public void setIds( final String ids )
    {
        this.ids = ids == null || ids.isBlank() ? ContentIds.empty() : ContentIds.from( ids.split( "," ) );
    }

    public String restore()
    {
        final ContentIds contentIds = ids;
        return submit( "Restore content", ( id, reporter ) -> restore( contentIds, reporter ) );
    }

    public String delete()
    {
        final ContentIds contentIds = ids;
        return submit( "Delete content", ( id, reporter ) -> delete( contentIds, reporter ) );
    }

    private String submit( final String description, final RunnableTask task )
    {
        return taskService.submitLocalTask( SubmitLocalTaskParams.create().runnableTask( task ).description( description ).build() )
            .toString();
    }

    private Contents getContents( final ContentIds contentIds )
    {
        return contentService.getByIds( GetContentByIdsParams.create().contentIds( contentIds ).build() );
    }

    private void restore( final ContentIds contentIds, final ProgressReporter reporter )
    {
        reporter.progress( ProgressReportParams.create( "Restoring content" ).build() );

        final Contents contents = getContents( contentIds );
        final int total = contentIds.getSize() + ArchiveDescendants.findIds( contentService, contents.getPaths() ).getSize();
        final Progress progress = new Progress( reporter, "restore", total );
        final ArchiveTaskResult result = new ArchiveTaskResult( ArchiveTaskResult.Kind.RESTORE );

        final List<Content> ordered = contents.stream().sorted( Comparator.comparingInt( ArchiveTaskHandler::originalDepth ) ).toList();

        for ( final Content content : ordered )
        {
            try
            {
                final int restored = contentService.restore(
                        RestoreContentParams.create().contentId( content.getId() ).restoreContentListener( progress::add ).build() )
                    .getRestoredContents()
                    .getSize();

                if ( restored == 1 )
                {
                    result.succeeded( content.getName().toString() );
                }
                else
                {
                    result.succeeded( restored );
                }
            }
            catch ( RestoreContentException e )
            {
                result.failed( e.getPath().getName().toString() );
            }
        }

        reporter.progress( ProgressReportParams.create( result.toJson() ).build() );
    }

    private void delete( final ContentIds contentIds, final ProgressReporter reporter )
    {
        reporter.progress( ProgressReportParams.create( "Deleting content" ).build() );

        final ContentPaths selected = getContents( contentIds ).getPaths();
        final ContentPaths paths = selected.stream()
            .filter( path -> selected.stream().noneMatch( path::isChildOf ) )
            .collect( ContentPaths.collector() );

        final Progress progress = new Progress( reporter, "delete", Math.toIntExact( countToDelete( paths ) ) );
        final ArchiveTaskResult result = new ArchiveTaskResult( ArchiveTaskResult.Kind.DELETE );

        for ( final ContentPath path : paths )
        {
            try
            {
                final int deleted =
                    contentService.delete( DeleteContentParams.create().contentPath( path ).deleteContentListener( progress::add ).build() )
                        .getDeletedContents()
                        .getSize();

                if ( deleted == 1 )
                {
                    result.succeeded( path.getName().toString() );
                }
                else
                {
                    result.succeeded( deleted );
                }
            }
            catch ( final Exception e )
            {
                if ( stillExists( path ) )
                {
                    result.failed( path.getName().toString() );
                }
            }
        }

        reporter.progress( ProgressReportParams.create( result.toJson() ).build() );
    }

    private long countToDelete( final ContentPaths paths )
    {
        final long inDraft = paths.getSize() + ArchiveDescendants.count( contentService, paths );

        final Context master = ContextBuilder.from( ContextAccessor.current() ).branch( MASTER ).build();
        final long published = master.callWith( () -> paths.stream().filter( contentService::contentExists ).count() );
        final long inMaster = published > 0 ? published + master.callWith( () -> ArchiveDescendants.count( contentService, paths ) ) : 0;

        return inDraft + inMaster;
    }

    private boolean stillExists( final ContentPath path )
    {
        try
        {
            return contentService.contentExists( path );
        }
        catch ( final Exception e )
        {
            return true;
        }
    }

    private static int originalDepth( final Content content )
    {
        return content.getOriginalParentPath() != null ? content.getOriginalParentPath().elementCount() : content.getPath().elementCount();
    }

    @Override
    public void initialize( final BeanContext context )
    {
        contentService = context.getService( ContentService.class ).get();
        taskService = context.getService( TaskService.class ).get();
    }

    private static final class Progress
    {
        private final ProgressReporter reporter;

        private final String phase;

        private final int total;

        private int current;

        private boolean started;

        private Progress( final ProgressReporter reporter, final String phase, final int total )
        {
            this.reporter = reporter;
            this.phase = phase;
            this.total = total;
        }

        private void add( final int count )
        {
            if ( !started )
            {
                started = true;
                reporter.progress( ProgressReportParams.create( ArchiveTaskResult.phase( phase, total ) ).build() );
            }
            current += count;
            reporter.progress( ProgressReportParams.create( current, total ).build() );
        }
    }
}
