import { Conf, Value, ValueWithUndefined } from './type';
import { getValue, typeIsArray } from './utils';

export function getDefaultByUrl<const C extends Conf[]>(conf: C, search = window.location.search) {
    const s = new URLSearchParams(search);

    // 组装类型随意点, 最后给定最后的类型
    const o: Record<string, any> = {};

    /**
     * 逻辑如下
     * 1. 循环第一次, 从 url 上取值(含 alias), 并赋值给 o
     *    此时 o 上的值为两种, 1. 取到的 url 上的有效值, 2.没取到有效值则为 undefined (无论是否为数组)
     * 2. 第二次遍历, 深度遍历检查依赖项(链)是否都存在, 如果不存在, 有值也修改为 undefined
     * 3. 第三次遍历, 如果有默认值, 给默认值
     *    此处允许多个相同的 key 组成的 Conf[], 前面的优先级最高, 取到了放弃后面的
     * 4. 第四次遍历, 基于上面没有默认值的,  数组给 []
     */

    // 先处理基础数据
    //   for (const c of conf) {
    //     // 如果是数组, 那么结果兜底是空数组;
    //     if (typeIsArray(c.type) && c.init === undefined) {
    //       c.init = [];
    //     }
    //   }

    // 先从 url 上取一遍值
    for (const c of conf) {
        const { key, type, alias = [] } = c;
        // 允许队列中有相同 key Conf 进行多次匹配, 如果前面 key 取到值了,后面的就抛弃
        if (o[key] !== undefined) {
            continue;
        }
        o[key] = undefined;

        const keys = [key, ...alias];
        for (const k of keys) {
            // 从 url 上依次按优先级取值
            const q = s.get(k);
            const v = getValue(type, q);
            // 只要取到值, 就跳出循环
            if (v !== undefined) {
                o[key] = v;
                break;
            }
        }
    }

    // 开始第二轮遍历, 查看依赖项
    for (const c of conf) {
        const { key, deps = [] } = c;
        const v = o[key];

        // 如果没值, 那么跳过, 因为不管依赖链是否完整,最后都是取 undefined]
        // 如果没依赖就跳过
        if (v === undefined || deps.length === 0) {
            continue;
        }

        // 如果不是所有依赖都有值, 那么抛弃掉取得值, 重置为 undefined
        const allDepsHasValue = depsDeepCheck(deps, o, conf);
        if (!allDepsHasValue) {
            o[key] = undefined;
        }
    }
    // 第三次遍历, 给默认值
    for (const c of conf) {
        const { key, defaultValue } = c;
        if (defaultValue && o[key] === undefined) {
            o[key] = defaultValue;
        }
    }

    // 第四次遍历
    // tip: 为什么不和第三次遍历合并.
    // 可能存在  [{key:a},{key:b},{key:a,init:1} ] 的情况
    // 多遍历一次代码比较清楚, 不合并了.
    for (const c of conf) {
        const { key } = c;
        if (typeIsArray(c.type) && o[key] === undefined) {
            o[key] = [];
        }
    }

    // 直接给定最后的类型
    // 如果是数组类型, 那么不会为 undefined
    // 如果设置了 init , 那么不会为 undefined
    return o as {
        [O in C[number] as O['key']]: Value<O> extends any[] ? Value<O> : ValueWithUndefined<O, Value<O>>;
    };
}

function depsDeepCheck<O = { [k in string]?: any }>(
    deps: string[] = [],
    o: O,
    conf: Conf[],
    tree: string[] = [],
): boolean {
    // 如果依赖项为空, 那么说明已经到底了, 整个依赖链为 true
    if (deps.length === 0) {
        return true;
    }

    //   const { key, deps = [] } = c;
    //   const v = o[key as keyof O];

    // 如果当前项有值, 并且没有依赖项, 那么到底为止, 整个依赖链为 true
    //   if (v !== undefined && deps.length === 0) {
    //     return true;
    //   }

    const allDepsIsOk = deps
        .filter(dKey => !tree.includes(dKey))
        .every(dKey => {
            // 检查过的 key 压入 tree, 避免死循环
            tree.push(dKey);

            const dConf = conf.find(c => c.key === dKey);
            // 如果在 ConfList 中找不到, 说明依赖不合法, 那么跳过
            if (!dConf) {
                console.warn(`ConfList 中找不到合法的依赖项 ${dKey}`);
                return true;
            }

            // 取出当前项的值
            const currDV = o[dKey as keyof O];
            if (currDV === undefined) {
                // 如果值无效那么依赖链无效
                return false;
            } else {
                // 当前值有效, 那么继续递归检查当前项的依赖链是否有效
                return depsDeepCheck(dConf.deps, o, conf, tree);
            }
        });

    return allDepsIsOk;
}

// const XX = getDefaultByUrl([
//   {
//     key: 'b',
//     type: 'n[]',
//   },
//   {
//     key: 'a',
//     type: 's',
//   },
//   {
//     key: 'c',
//     type: 'n',
//     init: 1,
//   },
// ]);

// console.log('XX', XX);
