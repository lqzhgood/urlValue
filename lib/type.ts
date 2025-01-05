import { SupportType, ValueType } from './rules';

export type Conf = {
    /** url query key */
    readonly key: string;
    /** url query key 类型, 支持一些特殊写法 */
    type: SupportType;
    /** 别名, 优先级从前往后 , key 最高 */
    alias?: readonly string[];
    /** 默认值 */
    defaultValue?: any;
    /**
     * 依赖的其他 keys, 为所有 Conf.key 的数组
     *  如果 deps 没值, 那么为 defaultValue 或者 undefined
     */
    deps?: string[];
};

// 定义一个类型映射函数，用于提取 O[K] 中的 type 字段的类型
export type ExtractConfType<O, K extends keyof Conf> = O extends {
    [key in K]: infer T;
}
    ? T
    : never;

export type Value<O> = ValueType<ExtractConfType<O, 'type'>>;

// 如果没有 defaultValue, 那么就是 undefined
export type ValueWithUndefined<O, V> = ExtractConfType<O, 'defaultValue'> extends never
    ? V | undefined
    : Exclude<V, undefined>;
