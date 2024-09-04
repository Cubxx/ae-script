/// <reference types="../../Types-for-Adobe/AfterEffects/23.0" />

type LooseObj = Record<string, unknown>;
interface Object {
  watch<T, K extends keyof T>(
    this: T,
    name: K,
    callback: (name: K, oldValue: T[K], newValue: T[K]) => void,
  ): void;
  unwatch<T, K extends keyof T>(this: T, name: K): void;
}
