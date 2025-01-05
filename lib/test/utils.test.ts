import dayjs from 'dayjs';
import { getValue } from '../utils';
import { describe, expect, it } from 'vitest';

import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

describe('getValue', function () {
    describe('数字-n', function () {
        const fn = v => getValue('n', v);
        it('正确', () => {
            expect(fn('1')).toStrictEqual(1);
            expect(fn('1.1')).toStrictEqual(1.1);
        });
        it('错误', () => {
            expect(fn(undefined)).toStrictEqual(undefined);
            expect(fn(null)).toStrictEqual(undefined);
            expect(fn('')).toStrictEqual(undefined);
            expect(fn('a')).toStrictEqual(undefined);
            expect(fn('a[]')).toStrictEqual(undefined);
        });
    });

    describe('字符串-s', function () {
        const fn = v => getValue('s', v);
        it('正确', () => {
            expect(fn('a')).toStrictEqual('a');
            expect(fn('a[]')).toStrictEqual('a[]');
        });
        it('错误', () => {
            expect(fn(undefined)).toStrictEqual(undefined);
            expect(fn(null)).toStrictEqual(undefined);
            expect(fn('1')).toStrictEqual(undefined);
            expect(fn('1.1')).toStrictEqual(undefined);
        });
    });
    describe('数字数组-n[]', function () {
        const fn = v => getValue('n[]', v);

        it('正确', () => {
            expect(fn('1,2,3,4')).toStrictEqual([1, 2, 3, 4]);
            expect(fn('1,2,3,4,')).toStrictEqual([1, 2, 3, 4]);
            expect(fn('1.1')).toStrictEqual([1.1]);
            expect(fn('1')).toStrictEqual([1]);
        });
        it('错误', () => {
            expect(fn(undefined)).toStrictEqual(undefined);
            expect(fn(null)).toStrictEqual(undefined);
            expect(fn('1,a')).toStrictEqual(undefined);
            expect(fn('1, ')).toStrictEqual(undefined);
            expect(fn('a')).toStrictEqual(undefined);
        });
    });

    describe('字符串数组-n[]', function () {
        const fn = v => getValue('s[]', v);

        it('正确', () => {
            expect(fn('a,b,c,d')).toStrictEqual(['a', 'b', 'c', 'd']);
            expect(fn('a,b,c,d,')).toStrictEqual(['a', 'b', 'c', 'd']);
            expect(fn('a.a')).toStrictEqual(['a.a']);
            expect(fn('a, ')).toStrictEqual(['a']);
            expect(fn('b')).toStrictEqual(['b']);
        });
        it('错误', () => {
            expect(fn(undefined)).toStrictEqual(undefined);
            expect(fn(null)).toStrictEqual(undefined);
            expect(fn('1,a')).toStrictEqual(undefined);
            expect(fn('1')).toStrictEqual(undefined);
        });
    });

    describe('布尔-boolean', function () {
        const fn = v => getValue('boolean', v);

        it('正确', () => {
            expect(fn('true')).toStrictEqual(true);
            expect(fn('false')).toStrictEqual(false);
        });
        it('错误', () => {
            expect(fn(undefined)).toStrictEqual(undefined);
            expect(fn(null)).toStrictEqual(undefined);
            expect(fn('1,a')).toStrictEqual(undefined);
            expect(fn('a')).toStrictEqual(undefined);
            expect(fn('1')).toStrictEqual(undefined);
            expect(fn('0')).toStrictEqual(undefined);
        });
    });

    describe('日期-Dayjs-YYYYMMDD', function () {
        const fn = v => getValue('Dayjs-YYYYMMDD', v);

        it('正确', () => {
            expect(fn('20200229')?.isSame(dayjs('2020-02-29'))).toStrictEqual(
                true
            );
        });
        it('错误', () => {
            expect(fn(undefined)).toStrictEqual(undefined);
            expect(fn(null)).toStrictEqual(undefined);
            expect(fn('20')).toStrictEqual(undefined);
            expect(fn('aa')).toStrictEqual(undefined);
            expect(fn('true')).toStrictEqual(undefined);
            expect(fn('1,2,3,4,5')).toStrictEqual(undefined);
            expect(fn('2022-02-01')).toStrictEqual(undefined);
            expect(fn('2022-02-31')).toStrictEqual(undefined);
            expect(fn('202211')).toStrictEqual(undefined);
            expect(fn('20220231')).toStrictEqual(undefined);
            expect(fn('2022/02/02')).toStrictEqual(undefined);
        });
    });
    describe('日期-Dayjs-YYYY-MM-DD', function () {
        const fn = v => getValue('Dayjs-YYYY-MM-DD', v);

        it('正确', () => {
            expect(fn('2020-02-29')?.isSame(dayjs('2020-02-29'))).toStrictEqual(
                true
            );
        });
        it('错误', () => {
            expect(fn(undefined)).toStrictEqual(undefined);
            expect(fn(null)).toStrictEqual(undefined);
            expect(fn('20')).toStrictEqual(undefined);
            expect(fn('aa')).toStrictEqual(undefined);
            expect(fn('true')).toStrictEqual(undefined);
            expect(fn('1,2,3,4,5')).toStrictEqual(undefined);
            expect(fn('2022-02-31')).toStrictEqual(undefined);
            expect(fn('2022/02/02')).toStrictEqual(undefined);
        });
    });

    describe('时间-Dayjs-YYYY-MM-DD-HH-mm-ss', function () {
        const fn = v => getValue('Dayjs-YYYY-MM-DD-HH-mm-ss', v);

        it('正确', () => {
            expect(
                fn('2020-02-29-12-00-00')?.isSame(dayjs('2020-02-29 12:00:00'))
            ).toStrictEqual(true);
        });
        it('错误', () => {
            expect(fn(undefined)).toStrictEqual(undefined);
            expect(fn(null)).toStrictEqual(undefined);
            expect(fn('20')).toStrictEqual(undefined);
            expect(fn('aa')).toStrictEqual(undefined);
            expect(fn('true')).toStrictEqual(undefined);
            expect(fn('1,2,3,4,5')).toStrictEqual(undefined);
            expect(fn('2022-02-20-12-39-61')).toStrictEqual(undefined);
            expect(fn('2022-02-20 12:00:00')).toStrictEqual(undefined);
        });
    });
});
