export interface StudioNodeJson {
    id: string;
    path: string;
    newPath?: string;
    branch: string;
    repo: string;
}

export interface StudioServerEvent {
    type: string;
    data?: {
        nodes?: StudioNodeJson[];
    };
}

type Listener = (event: StudioServerEvent) => void;

interface SocketState {
    listeners: Set<Listener>;
    worker?: SharedWorker;
    started: boolean;
}

export interface StudioUrls {
    sharedSocketUrl: string;
    eventsUrl: string;
}

const STATE_KEY = Symbol.for('com.enonic.app.contentstudio.plus.studioSocket');
const STUDIO_CONFIG_SCRIPT_ID = 'contentstudio-config-json';
const WORKER_NAME = 'shared-socket-worker-v2';
const FALLBACK_MESSAGE_EVENT = 'shared-socket:message:out';
const SERVER_MESSAGE_PREFIX = 'com.enonic.app.contentstudio.server.out.';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

// ! One state per page, not per bundle: an extension's script is evaluated again on every fetch of its
// ! html, and Content Studio's worker never drops a port, so each new port would stay there for good.
function getState(): SocketState {
    const scope = globalThis as unknown as Record<symbol, SocketState | undefined>;
    scope[STATE_KEY] ??= {listeners: new Set(), started: false};
    return scope[STATE_KEY];
}

export function readStudioUrls(): StudioUrls | undefined {
    try {
        const config: unknown = JSON.parse(document.getElementById(STUDIO_CONFIG_SCRIPT_ID)?.textContent ?? '');
        if (!isRecord(config) || !isRecord(config.services)) return undefined;

        const {sharedSocketUrl} = config;
        const {eventsUrl} = config.services;

        return typeof sharedSocketUrl === 'string' && typeof eventsUrl === 'string' ? {sharedSocketUrl, eventsUrl} : undefined;
    } catch {
        return undefined;
    }
}

function dispatch(state: SocketState, message: unknown): void {
    if (!isRecord(message) || message.type !== 'received' || !isRecord(message.payload)) return;

    const {type, payload} = message.payload;
    if (typeof type !== 'string' || !type.startsWith(SERVER_MESSAGE_PREFIX)) return;
    if (!isRecord(payload) || typeof payload.type !== 'string') return;

    const event: StudioServerEvent = {type: payload.type, data: payload.data};
    state.listeners.forEach((listener) => listener(event));
}

function listenToFallback(state: SocketState): void {
    window.addEventListener(FALLBACK_MESSAGE_EVENT, (event) => dispatch(state, (event as CustomEvent<unknown>).detail));
}

function start(state: SocketState): void {
    state.started = true;

    const urls = readStudioUrls();
    if (!urls) {
        console.warn('[Content Studio Plus] Content Studio config not found, server events are off.');
        return;
    }

    if (typeof SharedWorker === 'undefined') {
        listenToFallback(state);
        return;
    }

    try {
        // The same url and name as Content Studio uses, so the browser hands out its running worker.
        const worker = new SharedWorker(urls.sharedSocketUrl, {type: 'module', name: WORKER_NAME});
        worker.port.onmessage = (event: MessageEvent<unknown>) => dispatch(state, event.data);
        worker.port.postMessage({type: 'init', payload: {wsUrl: urls.eventsUrl}});
        state.worker = worker;
    } catch {
        listenToFallback(state);
    }
}

/** Server events Content Studio receives on its events socket, as they come. */
export function subscribeToStudioEvents(listener: Listener): () => void {
    const state = getState();
    state.listeners.add(listener);

    if (!state.started) {
        start(state);
    }

    return () => {
        state.listeners.delete(listener);
    };
}
