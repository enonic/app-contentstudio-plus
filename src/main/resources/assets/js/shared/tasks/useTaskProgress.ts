import {RequestError} from '@enonic/ui-utils';
import {pollTask, TaskFailedError, taskProgressPercent} from '@enonic/ui-utils/task';
import type {TaskInfo} from '@enonic/ui-types';
import {useEffect, useRef, useState} from 'react';
import {$config} from '../config';

export type TaskResultState = 'SUCCESS' | 'ERROR' | 'WARNING';

export interface TaskProgress {
    progress: number;
    phase?: string;
    phaseTotal?: number;
}

interface TaskProgressConfig {
    onComplete?: (state: TaskResultState, message: string) => void;
}

interface TaskResult {
    state: TaskResultState;
    message: string;
}

const RETRY_DELAY_MS = 2000;
const IDLE: TaskProgress = {progress: 0};

const getTasksUrl = (): string => `${$config.get().adminUrl.replace(/\/+$/, '')}/rest-v2/cs/tasks`;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

function parseInfo(task: TaskInfo): Record<string, unknown> | undefined {
    try {
        const info: unknown = JSON.parse(task.progress.info);
        return isRecord(info) ? info : undefined;
    } catch {
        return undefined;
    }
}

// A finished task reports its outcome as `{"state", "message"}` in the progress info, or as plain text.
function readResult(task: TaskInfo, fallbackState: TaskResultState): TaskResult {
    const info = parseInfo(task);
    const state = info?.state;

    return {
        state: state === 'SUCCESS' || state === 'ERROR' || state === 'WARNING' ? state : fallbackState,
        message: typeof info?.message === 'string' ? info.message : task.progress.info,
    };
}

// A running multi-phase task reports `{"phase", "count"}` in the progress info.
function readProgress(task: TaskInfo): TaskProgress {
    const info = parseInfo(task);
    const phase = typeof info?.phase === 'string' ? info.phase : undefined;
    const phaseTotal = phase != null && typeof info?.count === 'number' ? info.count : undefined;

    return {progress: Math.min(100, Math.max(0, taskProgressPercent(task))), phase, phaseTotal};
}

/** Follows a task by polling it until it ends; a server or network error is retried, a rejected read ends it. */
export function useTaskProgress(taskId: string | undefined, config: TaskProgressConfig = {}): TaskProgress {
    const [progress, setProgress] = useState<TaskProgress>(IDLE);
    const configRef = useRef(config);
    configRef.current = config;

    useEffect(() => {
        setProgress(IDLE);
        if (!taskId) return;

        const controller = new AbortController();
        const {signal} = controller;
        let retry: ReturnType<typeof setTimeout> | undefined;

        const complete = ({state, message}: TaskResult): void => {
            configRef.current.onComplete?.(state, message);
        };

        const poll = (): void => {
            void pollTask(getTasksUrl(), taskId, {
                signal,
                onProgress: (task) => {
                    if (!signal.aborted) setProgress(readProgress(task));
                },
            }).match(
                (task) => {
                    if (!signal.aborted) complete(readResult(task, 'SUCCESS'));
                },
                (error) => {
                    if (signal.aborted) return;

                    if (error instanceof TaskFailedError) {
                        complete({...readResult(error.task, 'ERROR'), state: 'ERROR'});
                    } else if (error instanceof RequestError && error.status >= 400 && error.status < 500) {
                        complete({state: 'ERROR', message: error.message});
                    } else {
                        retry = setTimeout(poll, RETRY_DELAY_MS);
                    }
                },
            );
        };

        poll();

        return () => {
            controller.abort();
            clearTimeout(retry);
        };
    }, [taskId]);

    return progress;
}
