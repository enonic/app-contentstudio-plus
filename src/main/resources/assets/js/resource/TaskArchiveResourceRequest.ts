import * as Q from 'q';
import {CmsProjectBasedResourceRequest} from 'lib-contentstudio/app/wizard/CmsProjectBasedResourceRequest';
import {TaskIdJson} from 'lib-admin-ui/task/TaskIdJson';
import {TaskState} from 'lib-admin-ui/task/TaskState';
import {TaskId} from 'lib-admin-ui/task/TaskId';
import {GetTaskInfoRequest} from 'lib-admin-ui/task/GetTaskInfoRequest';
import {TaskInfo} from 'lib-admin-ui/task/TaskInfo';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import {ArchiveResourceRequest} from './ArchiveResourceRequest';

export class TaskArchiveResourceRequest extends ArchiveResourceRequest<TaskId> {

    sendAndParseWithPolling(): Q.Promise<string> {
        return this.send().then((response: JsonResponse<TaskIdJson>) => {
            const deferred = Q.defer<string>();
            const taskId: TaskId = TaskId.fromJson(response.getResult());
            const poll = (interval: number = 500) => {
                setTimeout(() => {
                    new GetTaskInfoRequest(taskId).sendAndParse().then((task: TaskInfo) => {
                        let state = task.getState();
                        if (!task) {
                            deferred.reject('Task expired');
                            return; // task probably expired, stop polling
                        }

                        let progress = task.getProgress();

                        switch (state) {
                        case TaskState.FINISHED:
                            deferred.resolve(progress.getInfo());
                            break;
                        case TaskState.FAILED:
                            deferred.reject(progress.getInfo());
                            break;
                        default:
                            poll();
                        }
                    }).catch((reason: any) => {
                        DefaultErrorHandler.handle(reason);
                        deferred.reject(reason);
                    }).done();

                }, interval);
            };
            poll(0);

            return deferred.promise;
        });
    }
}
