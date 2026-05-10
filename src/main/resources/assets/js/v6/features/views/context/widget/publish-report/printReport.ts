// Print rendering for the Publish Report dialog.
//
// Why an iframe: when injected into Content Studio, the widget lives inside
// wrappers that set `transform`, `overflow`, and other properties which
// establish containing blocks and clip overflow. Anything we try to print
// from the host document inherits those constraints — the report ends up
// shifted by the sidebar offset and clipped to a single page.
//
// Workflow: create a hidden iframe, copy the host's stylesheets into its
// document, append a clone of the dialog wrapped in `#pr-print-root`, and
// trigger the browser's print dialog on the iframe window. The iframe is a
// fresh document with no ancestor constraints, so positioning / pagination
// work normally.

const DIALOG_SELECTOR = "[data-component='PublishReportDialog']";

const PRINT_CSS = `
    @page { margin: 1cm; size: auto; }
    html, body { margin: 0; padding: 0; background: #fff; color: #000; }
    ${DIALOG_SELECTOR} {
        --color-main: #000;
        --color-main-hover: #000;
        --color-subtle: #333;
        --color-alt: #fff;
        --color-rev: #fff;
        --color-surface: #fff;
        --color-surface-neutral: #fff;
        --color-surface-elevated: #fff;
        --color-bdr-subtle: #bbb;
        --color-bdr-soft: #888;
        display: block !important;
        position: static !important;
        width: auto !important;
        height: auto !important;
        max-width: none !important;
        max-height: none !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
        box-shadow: none !important;
        border: none !important;
        background: #fff !important;
        color: #000 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    /* Drop overflow / height caps on every descendant of the clone, but
     * leave \`.jsondiffpatch-unchanged\` alone so the "Show entire content"
     * collapse (\`max-height: 0\` in diff-overrides.less) still applies.
     * \`flex: 0 0 auto\` resets \`flex-1\` (Tailwind = \`1 1 0%\`): in a flex
     * column at content height, basis-0 children collapse to 0px and
     * content disappears into overflow. */
    ${DIALOG_SELECTOR} *:not(.jsondiffpatch-unchanged) {
        overflow: visible !important;
        max-height: none !important;
        min-height: auto !important;
        height: auto !important;
        flex: 0 0 auto !important;
    }
    ${DIALOG_SELECTOR} footer,
    ${DIALOG_SELECTOR} [data-component='Dialog.DefaultClose'],
    ${DIALOG_SELECTOR} label:has(input[type='checkbox']),
    ${DIALOG_SELECTOR} input[type='checkbox'] {
        display: none !important;
    }
    /* Force the pale (light-mode) jsondiffpatch palette over a white page,
     * overriding any dark-mode backgrounds inherited from the host CSS. */
    ${DIALOG_SELECTOR} pre {
        background: transparent !important;
        color: #000 !important;
    }
    ${DIALOG_SELECTOR} .jsondiffpatch-deleted .jsondiffpatch-property-name,
    ${DIALOG_SELECTOR} .jsondiffpatch-deleted .jsondiffpatch-value pre,
    ${DIALOG_SELECTOR} .jsondiffpatch-modified .jsondiffpatch-left-value pre,
    ${DIALOG_SELECTOR} .jsondiffpatch-textdiff-deleted {
        background: #ffbbbb !important;
        color: #000 !important;
    }
    ${DIALOG_SELECTOR} .jsondiffpatch-added .jsondiffpatch-property-name,
    ${DIALOG_SELECTOR} .jsondiffpatch-added .jsondiffpatch-value pre,
    ${DIALOG_SELECTOR} .jsondiffpatch-modified .jsondiffpatch-right-value pre,
    ${DIALOG_SELECTOR} .jsondiffpatch-textdiff-added {
        background: #bbffbb !important;
        color: #000 !important;
    }
    ${DIALOG_SELECTOR} .jsondiffpatch-moved .jsondiffpatch-moved-destination {
        background: #ffffbb !important;
        color: #000 !important;
    }
    ${DIALOG_SELECTOR} .jsondiffpatch-unchanged,
    ${DIALOG_SELECTOR} .jsondiffpatch-movedestination {
        color: #555 !important;
    }
`;

const collectHostStyles = (): string =>
    Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((el) => el.outerHTML)
        .join('\n');

const triggerPrint = (iframe: HTMLIFrameElement, iwin: Window): void => {
    iwin.focus();
    iwin.print();
    setTimeout(() => iframe.remove(), 1000);
};

const waitForStyles = (idoc: Document, iframe: HTMLIFrameElement, iwin: Window): void => {
    const links = Array.from(idoc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
    if (links.length === 0) {
        setTimeout(() => triggerPrint(iframe, iwin), 50);
        return;
    }

    let pending = links.length;
    const onLoaded = (): void => {
        pending--;
        if (pending === 0) triggerPrint(iframe, iwin);
    };
    links.forEach((link) => {
        link.addEventListener('load', onLoaded, {once: true});
        link.addEventListener('error', onLoaded, {once: true});
    });

    // Safety net: if a stylesheet load event never fires (cache / cross-origin),
    // print anyway after a few seconds.
    setTimeout(() => {
        if (pending > 0) {
            pending = 0;
            triggerPrint(iframe, iwin);
        }
    }, 3000);
};

export const printReport = (): void => {
    const source = document.querySelector(DIALOG_SELECTOR);
    if (!source) {
        window.print();
        return;
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:8.5in;height:11in;border:0;';
    document.body.appendChild(iframe);

    const idoc = iframe.contentDocument;
    const iwin = iframe.contentWindow;
    if (!idoc || !iwin) {
        iframe.remove();
        window.print();
        return;
    }

    idoc.open();
    idoc.write(
        `<!DOCTYPE html><html><head>${collectHostStyles()}<style>${PRINT_CSS}</style></head><body></body></html>`,
    );
    idoc.close();

    const printRoot = idoc.createElement('div');
    printRoot.id = 'pr-print-root';
    printRoot.appendChild(idoc.importNode(source, true));
    idoc.body.appendChild(printRoot);

    waitForStyles(idoc, iframe, iwin);
};
