import * as Q from 'q';
import {TaskIdJson} from '@enonic/lib-admin-ui/task/TaskIdJson';
import {TaskState} from '@enonic/lib-admin-ui/task/TaskState';
import {TaskId} from '@enonic/lib-admin-ui/task/TaskId';
import {GetTaskInfoRequest} from 'lib-contentstudio/app/resource/GetTaskInfoRequest';
import {TaskInfo} from '@enonic/lib-admin-ui/task/TaskInfo';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {ArchiveResourceRequest} from './ArchiveResourceRequest';

export class TaskArchiveResourceRequest extends ArchiveResourceRequest<TaskId> {

    sendAndParseWithPolling(): Q.Promise<string> {
        return this.send().then((response: JsonResponse<TaskIdJson>) => {
            const deferred = Q.defer<string>();
            const taskId: TaskId = TaskId.fromJson(response.getResult());
            const poll = (interval = 500): void => {
                setTimeout(() => {
                    new GetTaskInfoRequest(taskId).sendAndParse().then((task: TaskInfo) => {
                        const state = task.getState();
                        if (!task) {
                            deferred.reject('Task expired');
                            return; // task probably expired, stop polling
                        }

                        const progress = task.getProgress();

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
                    }).catch((reason) => {
                        DefaultErrorHandler.handle(reason);
                        deferred.reject(reason);
                    }).done();

                }, interval);
            };
            poll(0);

            return deferred.promise;
        });
    }

    protected parseResponse(response: JsonResponse<TaskIdJson>): TaskId {
        return TaskId.fromJson(response.getResult());
    }
}
