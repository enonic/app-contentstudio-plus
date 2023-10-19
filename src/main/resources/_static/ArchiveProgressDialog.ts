import {ArchiveDialog} from './ArchiveDialog';
import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import {ProgressBarManager} from 'lib-contentstudio/app/dialog/ProgressBarManager';
import {TaskState} from '@enonic/lib-admin-ui/task/TaskState';
import {ManagedActionExecutor} from '@enonic/lib-admin-ui/managedaction/ManagedActionExecutor';

export abstract class ArchiveProgressDialog
    extends ArchiveDialog
    implements ManagedActionExecutor {

    progressManager: ProgressBarManager;

    isExecuting(): boolean {
        return this.progressManager.isActive();
    }

    protected initElements(): void {
        super.initElements();

        this.progressManager = new ProgressBarManager({
            managingElement: this,
            processingLabel: this.getProcessingLabelText(),
        });
    }

    protected initListeners(): void {
        super.initListeners();

        this.progressManager.onProgressComplete((task: TaskState) => {
            if (task === TaskState.FINISHED) {
                const successMessage: string = this.totalToProcess > 1 ? this.getSuccessTextForMultiple() : this.getSuccessTextForSingle();
                NotifyManager.get().showSuccess(successMessage);
            } else {
                NotifyManager.get().showError(this.getFailText());
            }
        });

        this.progressManager.setSuppressNotifications(true);
    }

    protected executeAction(): void {
        this.doAction();
    }

    protected abstract getProcessingLabelText(): string;

    protected abstract getSuccessTextForMultiple(): string;

    protected abstract getSuccessTextForSingle(): string;

    protected abstract getFailText(): string;
}
