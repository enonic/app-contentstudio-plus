import {formatDate, pad} from '@enonic/ui-utils';

export const formatDateTime = (date: Date): string =>
    `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
