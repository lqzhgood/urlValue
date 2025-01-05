import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getDefaultByUrl } from '../index';
import { describe, expect, it } from 'vitest';

dayjs.extend(customParseFormat);

describe('getDefaultByUrl', function () {
    describe('基础', function () {
        const fn = search =>
            getDefaultByUrl(
                [
                    {
                        key: 'a',
                        type: 's',
                    },
                    {
                        key: 'b',
                        type: 's[]',
                    },
                    {
                        key: 'c',
                        type: 'n',
                    },
                    {
                        key: 'd',
                        type: 'n[]',
                    },
                    {
                        key: 'e',
                        type: 'boolean',
                    },
                    {
                        key: 'f',
                        type: 'Dayjs-YYYY-MM-DD',
                    },
                    {
                        key: 'g',
                        type: 'Dayjs-YYYY-MM-DD-HH-mm-ss',
                    },
                ],
                search
            );
        it('无值', () => {
            expect(fn('')).toStrictEqual({
                a: undefined,
                b: [],
                c: undefined,
                d: [],
                e: undefined,
                f: undefined,
                g: undefined,
            });
        });

        it('有值', () => {
            expect(
                fn(
                    new URLSearchParams({
                        a: 'a',
                        b: 'a,b,c',
                        c: '1',
                        d: '1,2,3',
                        e: 'true',
                        f: '2023-11-11',
                        g: '2023-11-11-23-11-11',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a',
                b: ['a', 'b', 'c'],
                c: 1,
                d: [1, 2, 3],
                e: true,
                f: dayjs('2023-11-11'),
                g: dayjs('2023-11-11 23:11:11'),
            });
        });
    });

    describe('默认值', function () {
        const fn = search =>
            getDefaultByUrl(
                [
                    {
                        key: 'a',
                        type: 's',
                        defaultValue: 'a',
                    },
                    {
                        key: 'b',
                        type: 's[]',
                        defaultValue: ['a', 'b', 'c'],
                    },
                    {
                        key: 'c',
                        type: 'n',
                        defaultValue: 1,
                    },
                    {
                        key: 'd',
                        type: 'n[]',
                        defaultValue: [1, 2, 3],
                    },
                    {
                        key: 'e',
                        type: 'boolean',
                        defaultValue: true,
                    },
                    {
                        key: 'f',
                        type: 'Dayjs-YYYY-MM-DD',
                        defaultValue: dayjs('2023-11-11'),
                    },
                    {
                        key: 'g',
                        type: 'Dayjs-YYYY-MM-DD-HH-mm-ss',
                        defaultValue: dayjs('2023-11-11 23:11:11'),
                    },
                ],
                search
            );
        it('使用默认值', () => {
            expect(fn('')).toStrictEqual({
                a: 'a',
                b: ['a', 'b', 'c'],
                c: 1,
                d: [1, 2, 3],
                e: true,
                f: dayjs('2023-11-11'),
                g: dayjs('2023-11-11 23:11:11'),
            });
        });

        it('忽略默认值', () => {
            expect(
                fn(
                    new URLSearchParams({
                        a: 'a1',
                        b: 'a1,b1,c1',
                        c: '11',
                        d: '11,21,31',
                        e: 'false',
                        f: '2024-01-01',
                        g: '2024-01-01-01-11-11',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a1',
                b: ['a1', 'b1', 'c1'],
                c: 11,
                d: [11, 21, 31],
                e: false,
                f: dayjs('2024-01-01'),
                g: dayjs('2024-01-01 01:11:11'),
            });
        });
    });

    describe('别名', function () {
        it('优先级', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            alias: ['aa', 'bb'],
                        },
                    ],
                    new URLSearchParams({
                        a: 'a1',
                        aa: 'aa',
                        bb: 'bb',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a1',
            });
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            alias: ['aa', 'bb'],
                        },
                    ],
                    new URLSearchParams({
                        aa: 'aa',
                        bb: 'bb',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'aa',
            });
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            alias: ['aa', 'bb'],
                            defaultValue: 'a',
                        },
                    ],
                    new URLSearchParams({
                        bb: 'bb',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'bb',
            });
        });

        it('默认值', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            alias: ['aa', 'bb'],
                            defaultValue: 'a',
                        },
                    ],
                    new URLSearchParams({
                        c: 'a1',
                        cc: 'aa',
                        ccc: 'bb',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a',
            });
        });
    });

    describe('依赖', function () {
        it('符合依赖', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b', 'c'],
                        },
                        {
                            key: 'b',
                            type: 'n',
                        },
                        {
                            key: 'c',
                            type: 'n[]',
                        },
                    ],
                    new URLSearchParams({
                        a: 'a1',
                        b: '1',
                        c: '1,3',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a1',
                b: 1,
                c: [1, 3],
            });
        });
        it('不符合依赖', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                        },
                        {
                            key: 'b',
                            type: 'n',
                        },
                    ],
                    new URLSearchParams({
                        a: 'a1',
                        b: 'a',
                    }).toString()
                )
            ).toStrictEqual({
                a: undefined,
                b: undefined,
            });
        });
        it('符合依赖+默认值', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b', 'c'],
                        },
                        {
                            key: 'b',
                            type: 'n',
                        },
                        {
                            key: 'c',
                            type: 'n[]',
                            defaultValue: [1, 3],
                        },
                    ],
                    new URLSearchParams({
                        a: 'a1',
                        b: '3',
                    }).toString()
                )
            ).toStrictEqual({
                a: undefined,
                b: 3,
                c: [1, 3],
            });
        });
    });

    describe('循环依赖', function () {
        it('符合依赖', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                        },
                        {
                            key: 'b',
                            type: 'n[]',
                            deps: ['a'],
                        },
                    ],
                    new URLSearchParams({
                        a: 'a1',
                        b: '1,3',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a1',
                b: [1, 3],
            });
        });
        it('符合依赖-默认值', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                            defaultValue: 'a1',
                        },
                        {
                            key: 'b',
                            type: 'n[]',
                            deps: ['a'],
                            defaultValue: [1, 3],
                        },
                    ],
                    new URLSearchParams({}).toString()
                )
            ).toStrictEqual({
                a: 'a1',
                b: [1, 3],
            });
        });
        it('符合依赖-默认值1', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                            defaultValue: 'a1',
                        },
                        {
                            key: 'b',
                            type: 'n[]',
                            deps: ['a'],
                        },
                    ],
                    new URLSearchParams({
                        b: '1,3',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a1',
                b: [],
            });
        });
        it('符合依赖-默认值2', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                        },
                        {
                            key: 'b',
                            type: 'n[]',
                            deps: ['a'],
                            defaultValue: [1, 3],
                        },
                    ],
                    new URLSearchParams({
                        a: 'a1',
                    }).toString()
                )
            ).toStrictEqual({
                a: undefined,
                b: [1, 3],
            });
        });

        it('不符合依赖', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                        },
                        {
                            key: 'b',
                            type: 'n',
                            deps: ['a'],
                        },
                    ],
                    new URLSearchParams({}).toString()
                )
            ).toStrictEqual({
                a: undefined,
                b: undefined,
            });
        });
        it('不符合依赖-前序-无值-取默认值', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                            defaultValue: 'a1',
                        },
                        {
                            key: 'b',
                            type: 'n',
                            deps: ['a'],
                        },
                    ],
                    new URLSearchParams({}).toString()
                )
            ).toStrictEqual({
                a: 'a1',
                b: undefined,
            });
        });
        it('不符合依赖-前序-有值-取默认值', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                            defaultValue: 'a1',
                        },
                        {
                            key: 'b',
                            type: 'n',
                            deps: ['a'],
                        },
                    ],
                    new URLSearchParams({
                        a: 'bb',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a1',
                b: undefined,
            });
        });
        it('不符合依赖-后序-无值-取默认值', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                        },
                        {
                            key: 'b',
                            type: 'n',
                            deps: ['a'],
                            defaultValue: 1,
                        },
                    ],
                    new URLSearchParams({}).toString()
                )
            ).toStrictEqual({
                a: undefined,
                b: 1,
            });
        });
        it('不符合依赖-后序-有值-取默认值', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                        },
                        {
                            key: 'b',
                            type: 'n',
                            deps: ['a'],
                            defaultValue: 1,
                        },
                    ],
                    new URLSearchParams({
                        b: '33',
                    }).toString()
                )
            ).toStrictEqual({
                a: undefined,
                b: 1,
            });
        });
        it('符合依赖-逐级依赖', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                        },
                        {
                            key: 'b',
                            type: 'n',
                            deps: ['c'],
                        },
                        {
                            key: 'c',
                            type: 'n[]',
                        },
                    ],
                    new URLSearchParams({
                        a: 'a1',
                        b: '1',
                        c: '1,3',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a1',
                b: 1,
                c: [1, 3],
            });
        });
        it('不符合依赖-逐级依赖', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                        },
                        {
                            key: 'b',
                            type: 'n',
                            deps: ['c'],
                        },
                        {
                            key: 'c',
                            type: 'n[]',
                        },
                    ],
                    new URLSearchParams({
                        a: 'a1',
                        b: '1',
                    }).toString()
                )
            ).toStrictEqual({
                a: undefined,
                b: undefined,
                c: [],
            });
        });
        it('符合依赖-前序-逐级依赖-有默认值', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                            defaultValue: 'a1',
                        },
                        {
                            key: 'b',
                            type: 'n',
                            deps: ['c'],
                        },
                        {
                            key: 'c',
                            type: 'n[]',
                        },
                    ],
                    new URLSearchParams({
                        b: '1',
                        c: '1,3,4',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a1',
                b: 1,
                c: [1, 3, 4],
            });
        });
        it('符合依赖-后序-逐级依赖-有默认值', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            deps: ['b'],
                        },
                        {
                            key: 'b',
                            type: 'n',
                            deps: ['c'],
                        },
                        {
                            key: 'c',
                            type: 'n[]',
                            defaultValue: [1, 3, 4],
                        },
                    ],
                    new URLSearchParams({
                        a: 'a1',
                        b: '1',
                    }).toString()
                )
            ).toStrictEqual({
                a: undefined,
                b: undefined,
                c: [1, 3, 4],
            });
        });
    });
    describe('多次类型匹配', function () {
        it('判断前面', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                        },
                        {
                            key: 'a',
                            type: 'n',
                        },
                    ],
                    new URLSearchParams({
                        a: 'a1',
                    }).toString()
                )
            ).toStrictEqual({
                a: 'a1',
            });
        });
        it('判断后面', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                        },
                        {
                            key: 'a',
                            type: 'n',
                        },
                    ],
                    new URLSearchParams({
                        a: '1',
                    }).toString()
                )
            ).toStrictEqual({
                a: 1,
            });
        });
        it('默认值-前面', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            defaultValue: 'a1',
                        },
                        {
                            key: 'a',
                            type: 'n',
                        },
                    ],
                    new URLSearchParams({}).toString()
                )
            ).toStrictEqual({
                a: 'a1',
            });
        });
        it('默认值-后面', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                        },
                        {
                            key: 'a',
                            type: 'n',
                            defaultValue: 1,
                        },
                    ],
                    new URLSearchParams({}).toString()
                )
            ).toStrictEqual({
                a: 1,
            });
        });
        it('默认值-优先级-前面优先级最高', () => {
            expect(
                getDefaultByUrl(
                    [
                        {
                            key: 'a',
                            type: 's',
                            defaultValue: 'a1',
                        },
                        {
                            key: 'a',
                            type: 'n',
                            defaultValue: 1,
                        },
                    ],
                    new URLSearchParams({}).toString()
                )
            ).toStrictEqual({
                a: 'a1',
            });
        });
    });
});
