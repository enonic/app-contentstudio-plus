package com.enonic.xp.app.contentstudio.plus.archive;

import java.util.ArrayList;
import java.util.List;

final class ArchiveTaskResult
{
    enum Kind
    {
        RESTORE( "Nothing was restored.", "Item \"%s\" has been restored.", "%d items have been restored.",
                 "Item \"%s\" could not be restored.", "Failed to restore %d items." ),

        DELETE( "Nothing to delete.", "Item \"%s\" has been deleted.", "%d items have been deleted.", "Item \"%s\" could not be deleted.",
                "Failed to delete %d items." );

        private final String nothing;

        private final String oneSucceeded;

        private final String manySucceeded;

        private final String oneFailed;

        private final String manyFailed;

        Kind( final String nothing, final String oneSucceeded, final String manySucceeded, final String oneFailed,
              final String manyFailed )
        {
            this.nothing = nothing;
            this.oneSucceeded = oneSucceeded;
            this.manySucceeded = manySucceeded;
            this.oneFailed = oneFailed;
            this.manyFailed = manyFailed;
        }
    }

    private final Kind kind;

    private final List<String> succeeded = new ArrayList<>();

    private final List<String> failed = new ArrayList<>();

    ArchiveTaskResult( final Kind kind )
    {
        this.kind = kind;
    }

    void succeeded( final String name )
    {
        succeeded.add( name );
    }

    void succeeded( final int count )
    {
        for ( int i = 0; i < count; i++ )
        {
            succeeded.add( "" );
        }
    }

    void failed( final String name )
    {
        failed.add( name );
    }

    String getState()
    {
        if ( !succeeded.isEmpty() && failed.isEmpty() )
        {
            return "SUCCESS";
        }
        return succeeded.isEmpty() && !failed.isEmpty() ? "ERROR" : "WARNING";
    }

    String getMessage()
    {
        if ( succeeded.isEmpty() && failed.isEmpty() )
        {
            return kind.nothing;
        }

        final List<String> parts = new ArrayList<>();
        if ( succeeded.size() == 1 )
        {
            parts.add( String.format( kind.oneSucceeded, succeeded.get( 0 ) ) );
        }
        else if ( succeeded.size() > 1 )
        {
            parts.add( String.format( kind.manySucceeded, succeeded.size() ) );
        }

        if ( failed.size() == 1 )
        {
            parts.add( String.format( kind.oneFailed, failed.get( 0 ) ) );
        }
        else if ( failed.size() > 1 )
        {
            parts.add( String.format( kind.manyFailed, failed.size() ) );
        }

        return String.join( " ", parts );
    }

    String toJson()
    {
        return "{\"state\":\"" + getState() + "\",\"message\":\"" + escape( getMessage() ) + "\"}";
    }

    static String phase( final String phase, final int count )
    {
        return String.format( "{\"phase\":\"%s\",\"count\":%d}", phase, count );
    }

    private static String escape( final String value )
    {
        final StringBuilder result = new StringBuilder();
        for ( final char c : value.toCharArray() )
        {
            if ( c == '"' || c == '\\' )
            {
                result.append( '\\' ).append( c );
            }
            else if ( c < 0x20 )
            {
                result.append( String.format( "\\u%04x", (int) c ) );
            }
            else
            {
                result.append( c );
            }
        }
        return result.toString();
    }
}
