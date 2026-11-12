import {cn} from '@enonic/ui';
import {
    Archive,
    Database,
    FileChartPie,
    FileCog,
    FileIcon,
    FileMusic,
    FileQuestionMark,
    FileSpreadsheet,
    FileTerminal,
    FileText,
    FileType,
    Film,
    FolderCog,
    FolderOpen,
    Globe,
    ImageIcon,
    type LucideIcon,
    Presentation,
    Shapes,
    SplinePointer,
    SquareArrowOutUpRight,
    SquareCode,
    SquarePlay,
} from 'lucide-react';
import {type ReactElement, useEffect, useState} from 'react';

type Props = {
    className?: string;
    contentType: string;
    url?: string | null;
};

const IMAGE_SIZE = 128;

const IMAGE_CONTENT_TYPES = new Set<string>(['media:image', 'media:vector']);

const BUILT_IN_ICONS = new Map<string, LucideIcon>([
    ['base:folder', FolderOpen],
    ['portal:fragment', FileChartPie],
    ['base:media', SquarePlay],
    ['media:archive', Archive],
    ['media:audio', FileMusic],
    ['media:code', SquareCode],
    ['media:data', Database],
    ['media:document', FileText],
    ['media:executable', FileTerminal],
    ['media:image', ImageIcon],
    ['media:presentation', Presentation],
    ['media:spreadsheet', FileSpreadsheet],
    ['media:text', FileType],
    ['media:unknown', FileQuestionMark],
    ['media:vector', SplinePointer],
    ['media:video', Film],
    ['portal:page-template', FileCog],
    ['base:shortcut', SquareArrowOutUpRight],
    ['portal:site', Globe],
    ['portal:template-folder', FolderCog],
    ['base:unstructured', Shapes],
]);

// Keeps the query the server sent, such as its cache-buster, and sets the size next to it.
function withImageSize(url: string): string {
    const queryIndex = url.indexOf('?');
    const base = queryIndex >= 0 ? url.substring(0, queryIndex) : url;
    const search = new URLSearchParams(queryIndex >= 0 ? url.substring(queryIndex + 1) : '');
    search.set('size', String(IMAGE_SIZE));
    search.set('crop', 'false');

    return `${base}?${search.toString()}`;
}

// The server marks svg type icons painted only with `currentColor`.
const isColorable = (url: string): boolean => new URLSearchParams(url.substring(url.indexOf('?') + 1)).get('colorable') === 'true';

export const ContentIcon = ({className, contentType, url}: Props): ReactElement => {
    const src = url ? withImageSize(url) : undefined;
    const [isImageBroken, setImageBroken] = useState(false);

    useEffect(() => {
        setImageBroken(false);
    }, [src]);

    const isPhoto = IMAGE_CONTENT_TYPES.has(contentType);
    const isCustomTypeGlyph = !isPhoto && !BUILT_IN_ICONS.has(contentType);

    if (src && !isImageBroken && (isPhoto || isCustomTypeGlyph)) {
        if (isCustomTypeGlyph && isColorable(src)) {
            return (
                <span
                    role="img"
                    aria-label={contentType}
                    className={cn('inline-block size-6 p-px bg-current mask-contain mask-center mask-no-repeat', className)}
                    style={{maskImage: `url("${src}")`}}
                />
            );
        }

        return (
            <img
                className={cn('size-6 p-px object-contain', !isPhoto && 'rounded-sm dark:bg-alt', className)}
                alt={contentType}
                src={src}
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setImageBroken(true)}
            />
        );
    }

    const Icon = BUILT_IN_ICONS.get(contentType) ?? FileIcon;

    return <Icon className={cn('size-6', className)} strokeWidth={1.75} />;
};

ContentIcon.displayName = 'ContentIcon';
