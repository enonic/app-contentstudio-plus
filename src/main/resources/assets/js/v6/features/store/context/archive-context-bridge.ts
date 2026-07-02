import {$contextContent} from '@enonic/lib-contentstudio/v6/widgets/context-panel/model/contextContent.store';
import {$currentItems} from '../archive-selection';

// Force lib-cs $contextContent.onMount to run once. Without an active subscriber, the mode-driven
// reset that runs on first subscribe would clobber later set() calls. The empty listener keeps the
// store mounted for the lifetime of the archive bundle.
$contextContent.listen(() => undefined);

$currentItems.subscribe((items) => {
    const last = items.at(-1);
    $contextContent.set(last?.getContentSummary() ?? null);
});
