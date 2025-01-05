import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import {
    isBoolean,
    isDayjsYYYY_MM_DD,
    isDayjsYYYY_MM_DD_HH_mm_ss,
    isDayjsYYYYMMDD,
    isNumber,
    isNumberArray,
    isString,
    isStringArray,
    isUndefined,
    SPLITTER,
    SupportType,
    ValueType,
} from './rules';

dayjs.extend(customParseFormat);

export function typeIsArray(type: SupportType) {
    return type.endsWith('[]');
}

export function getValue<const T extends SupportType>(
    type: T,
    value: string | undefined | null,
): undefined | ValueType<T> {
    if (isUndefined(value)) {
        return undefined;
    }

    if (type === 's') {
        const v = isString(value) ? value : undefined;
        return v as ValueType<typeof type> | undefined;
    }

    if (type === 'n') {
        const v: ValueType<'n'> | undefined = isNumber(value) ? Number(value) : undefined;
        return v as ValueType<typeof type> | undefined;
    }

    if (type === 's[]') {
        const v = isStringArray(value)
            ? value
                  .split(SPLITTER)
                  .map(v => v.trim())
                  .filter(v => v)
            : undefined;
        return v as ValueType<typeof type> | undefined;
    }

    if (type === 'n[]') {
        const v = isNumberArray(value)
            ? value
                  .split(SPLITTER)
                  .map(v => Number(v))
                  .filter(v => v)
            : undefined;
        return v as ValueType<typeof type> | undefined;
    }

    if (type === 'boolean') {
        const v = isBoolean(value) ? value === 'true' : undefined;
        return v as ValueType<typeof type>;
    }

    if (type === 'Dayjs-YYYYMMDD') {
        const v = isDayjsYYYYMMDD(value) ? dayjs(value, 'YYYYMMDD', true) : undefined;
        return v as ValueType<typeof type>;
    }

    if (type === 'Dayjs-YYYY-MM-DD') {
        const v = isDayjsYYYY_MM_DD(value) ? dayjs(value, 'YYYY-MM-DD', true) : undefined;
        return v as ValueType<typeof type>;
    }

    if (type === 'Dayjs-YYYY-MM-DD-HH-mm-ss') {
        const v = isDayjsYYYY_MM_DD_HH_mm_ss(value) ? dayjs(value, 'YYYY-MM-DD-HH-mm-ss', true) : undefined;
        return v as ValueType<typeof type>;
    }

    return undefined;
}
