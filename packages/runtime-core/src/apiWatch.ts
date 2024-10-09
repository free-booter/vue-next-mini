import { EffectScheduler, ReactiveEffect } from "packages/reactivity/src/effect"
import { isObject, isReactive } from "packages/reactivity/src/reactive"
import { queuePreFlushCb } from "./scheduler"
import { hasChanged } from "@vue/share"

export interface WatchOptions<Immediate = boolean> {
  immediate?: Immediate
  deep?: boolean
}

export function watch(
  source: any,
  cb: any,
  options?: WatchOptions) {
  return doWatch(source, cb, options)
}

function doWatch(
  source: any,
  cb: any,
  { immediate, deep }: WatchOptions = {}) {
  let getter: () => any

  if (isReactive(source)) {
    getter = () => source
    deep = true
  } else {
    getter = () => { }
  }
  let oldValue = {}
  const job = () => {
    if (cb) {
      const newValue = effect.run()
      if (deep || hasChanged(oldValue, newValue)) {
        cb(newValue, oldValue)
        oldValue = newValue
      }
    }
  }
  if (cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }
  let scheduler: EffectScheduler = () => queuePreFlushCb(job)

  let effect = new ReactiveEffect(getter, scheduler)

  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

}

function traverse(value: any, seen = new Set()) {
  if (!isObject(value)) return value
  if (seen.has(value)) return value
  seen.add(value)
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen)
    }
  } else {
    for (const key in value) {
      traverse(value[key], seen)
    }
  }
  return value
}