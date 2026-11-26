package com.enonic.xp.app.contentstudio.plus.archive;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;
import com.enonic.xp.schema.content.ContentType;
import com.enonic.xp.schema.content.ContentTypeService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.script.serializer.MapSerializable;

public class ContentTypeTitlesHandler
    implements ScriptBean
{
    private List<Locale> locales = List.of();

    private ContentTypeService contentTypeService;

    private LocaleService localeService;

    public void setLocales( final String locales )
    {
        this.locales = locales == null || locales.isBlank()
            ? List.of()
            : Arrays.stream( locales.split( "," ) ).map( String::trim ).map( Locale::forLanguageTag ).collect( Collectors.toList() );
    }

    public MapSerializable getTitles()
    {
        return gen -> contentTypeService.getAll()
            .forEach( contentType -> gen.value( contentType.getName().toString().toLowerCase( Locale.ROOT ), localizeTitle( contentType ) ) );
    }

    private String localizeTitle( final ContentType contentType )
    {
        final String key = contentType.getTitleI18nKey();
        if ( key == null || key.isBlank() )
        {
            return contentType.getTitle();
        }

        final ApplicationKey applicationKey = contentType.getName().getApplicationKey();
        final MessageBundle bundle = localeService.getBundle( applicationKey, localeService.getSupportedLocale( locales, applicationKey ) );
        final String localized = bundle != null ? bundle.localize( key ) : null;

        return localized != null ? localized : contentType.getTitle();
    }

    @Override
    public void initialize( final BeanContext context )
    {
        contentTypeService = context.getService( ContentTypeService.class ).get();
        localeService = context.getService( LocaleService.class ).get();
    }
}
