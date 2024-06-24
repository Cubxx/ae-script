type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
    ? 1
    : 2
    ? true
    : false;
/**获取非只读属性 */
type NonReadonlyKeys<
    T,
    U extends Readonly<T> = Readonly<T>,
    K extends keyof T = keyof T,
> = K extends keyof T
    ? Equal<Pick<T, K>, Pick<U, K>> extends false
        ? K
        : never
    : never;
/**联合类型转交叉类型 */
type UnionToIntersection<T> = (T extends any ? (e: T) => void : never) extends (
    e: infer U,
) => void
    ? U
    : never;
/**获取联合类型的末值 */
type LastOfUnion<T> = UnionToIntersection<
    T extends any ? (e: T) => void : never
> extends (e: infer U) => void
    ? U
    : never;
/**联合类型转元组 */
type UnionToTuple<T, R extends any[] = [], E = LastOfUnion<T>> = [E] extends [
    never,
]
    ? R
    : UnionToTuple<Exclude<T, E>, [E, ...R]>;
