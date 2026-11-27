package com.enonic.xp.app.contentstudio.plus.archive;

import java.util.List;

import com.enonic.xp.archive.ArchiveConstants;
import com.enonic.xp.content.ContentIds;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentPaths;
import com.enonic.xp.content.ContentQuery;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.content.FindContentIdsByQueryResult;
import com.enonic.xp.query.expr.CompareExpr;
import com.enonic.xp.query.expr.ConstraintExpr;
import com.enonic.xp.query.expr.FieldExpr;
import com.enonic.xp.query.expr.FieldOrderExpr;
import com.enonic.xp.query.expr.LogicalExpr;
import com.enonic.xp.query.expr.OrderExpr;
import com.enonic.xp.query.expr.QueryExpr;
import com.enonic.xp.query.expr.ValueExpr;

final class ArchiveDescendants
{
    private static final String ROOT = ArchiveConstants.ARCHIVE_ROOT_PATH.toString();

    private static final int ALL = -1;

    private ArchiveDescendants()
    {
    }

    static ContentIds findIds( final ContentService contentService, final ContentPaths paths )
    {
        return paths.isEmpty() ? ContentIds.empty() : find( contentService, paths, ALL ).getContentIds();
    }

    static long count( final ContentService contentService, final ContentPaths paths )
    {
        return paths.isEmpty() ? 0 : find( contentService, paths, 0 ).getTotalHits();
    }

    private static FindContentIdsByQueryResult find( final ContentService contentService, final ContentPaths paths, final int size )
    {
        final FieldExpr field = FieldExpr.from( "_path" );

        ConstraintExpr expr = null;
        for ( final ContentPath path : paths )
        {
            final ConstraintExpr children = CompareExpr.like( field, ValueExpr.string( ROOT + path + "/*" ) );
            expr = expr == null ? children : LogicalExpr.or( expr, children );
        }

        final List<ValueExpr> self = paths.stream().map( path -> ValueExpr.string( ROOT + path ) ).toList();
        final QueryExpr query =
            QueryExpr.from( LogicalExpr.and( expr, CompareExpr.notIn( field, self ) ), new FieldOrderExpr( field, OrderExpr.Direction.ASC ) );

        return contentService.find( ContentQuery.create().size( size ).queryExpr( query ).build() );
    }
}
