import { hasChanged } from "@vue/share";
import { activeEffect, track, trackEffects, trigger, triggerEffects } from "./effect";
import { isObject, reactive, toReactive } from "./reactive";
import { createDep, Dep } from "./dep";

export function ref(value: any) {
  return createRef(value)
}

export function createRef(rawValue: any) {
  return new RefImpl(rawValue)
}


class RefImpl<T> {
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(value: any, public readonly __v_isShallow: boolean = false) {
    this._rawValue = value
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    // 判断是否改变
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = this.__v_isShallow ? newValue : toReactive(newValue)
      triggerRefValue(this, newValue)
    }
  }
}

type RefBase<T> = {
  dep?: Dep,
  value: T
}
export function trackRefValue(ref: RefBase<any>) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

export function triggerRefValue(ref: RefBase<any>, newVal?: any) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}