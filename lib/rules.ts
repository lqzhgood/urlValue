/* eslint-disable @typescript-eslint/naming-convention */
import dayjs, { Dayjs } from 'dayjs';

export type SupportType =
    | 's'
    | 'n'
    | 's[]'
    | 'n[]'
    | 'boolean'
    | 'Dayjs-YYYYMMDD'
    | 'Dayjs-YYYY-MM-DD'
    | 'Dayjs-YYYY-MM-DD-HH-mm-ss';

export type ValueType<T> = T extends 's'
    ? string | undefined
    : T extends 'n'
      ? number | undefined
      : T extends 's[]'
        ? string[]
        : T extends 'n[]'
          ? number[]
          : T extends 'boolean'
            ? boolean
            : T extends 'Dayjs-YYYYMMDD'
              ? Dayjs
              : T extends 'Dayjs-YYYY-MM-DD'
                ? Dayjs
                : T extends 'Dayjs-YYYY-MM-DD-HH-mm-ss'
                  ? Dayjs
                  : T;

export const SPLITTER = ',';

export function isNumberLike(n: any) {
    return !isNaN(parseFloat(n as string)) && isFinite(n as number);
}

export function isUndefined(value: string | undefined | null): value is undefined | null {
    if (!value || value === 'undefined' || value === 'null') {
        return true;
    } else {
        return false;
    }
}

export function isArray(value: string): value is 's[]' | 'n[]' {
    return value.includes(SPLITTER);
}

export function isString(value: string): value is string {
    return !isArray(value) && !isNumberLike(value);
}

export function isNumber(value: string): value is 'n' {
    return !isArray(value) && isNumberLike(value);
}

export function isStringArray(value: string): value is 's[]' {
    const arr = value.split(SPLITTER);
    return arr.every(item => isString(item));
}

export function isNumberArray(value: string): value is 'n[]' {
    const arr = value.split(SPLITTER);
    return arr.filter(v => v).every(item => isNumber(item));
}

export function isBoolean(value: string): value is 'true' | 'false' {
    return value === 'true' || value === 'false';
}

export function isDayjsYYYYMMDD(value: string): value is 'Dayjs' {
    return dayjs(value, 'YYYYMMDD', true).isValid();
}

export function isDayjsYYYY_MM_DD(value: string): value is 'Dayjs' {
    return dayjs(value, 'YYYY-MM-DD', true).isValid();
}

export function isDayjsYYYY_MM_DD_HH_mm_ss(value: string): value is 'Dayjs' {
    return dayjs(value, 'YYYY-MM-DD-HH-mm-ss', true).isValid();
}
