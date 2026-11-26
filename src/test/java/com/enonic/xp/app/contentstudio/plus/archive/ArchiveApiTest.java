package com.enonic.xp.app.contentstudio.plus.archive;

import java.util.Locale;

import org.mockito.Mockito;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;
import com.enonic.xp.schema.content.ContentType;
import com.enonic.xp.schema.content.ContentTypeName;
import com.enonic.xp.schema.content.ContentTypeService;
import com.enonic.xp.schema.content.ContentTypes;
import com.enonic.xp.testing.ScriptRunnerSupport;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

public class ArchiveApiTest
    extends ScriptRunnerSupport
{
    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

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

    @Override
    public String getScriptTestFile()
    {
        return "/test/archive-test.js";
    }
}
