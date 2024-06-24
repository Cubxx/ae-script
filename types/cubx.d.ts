interface Array<T> {
    map<U>(fn: (e: T, i: number, arr: this) => U, order?: boolean): U[];
    filter<U extends T>(fn: (value: T, index: number, array: this) => value is U): U[];
}
interface Object {
    is<T>(constructor: new (...args: any[]) => T): T;
    each<T extends {}>(this: T, fn: <K extends keyof T>(value: T[K], key: K, obj: T) => void): void;
    assign<T>(this: T, config: Partial<T>): T;
}
interface PropertyGroup {
    map<T>(fn: (e: _PropertyClasses, i: number, arr: this) => T, order?: boolean): T[];
    filter<U extends _PropertyClasses>(
        fn: (value: _PropertyClasses, index: number, array: this) => value is U,
    ): U[];
}
interface MaskPropertyGroup {
    map<T>(fn: (e: _PropertyClasses, i: number, arr: this) => T, order?: boolean): T[];
    filter<U extends _PropertyClasses>(
        fn: (value: _PropertyClasses, index: number, array: this) => value is U,
    ): U[];
}
