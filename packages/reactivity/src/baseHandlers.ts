import { track, trigger } from "./effect"
import { isObject, reactive } from "./reactive"

const get = createGetter()

function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)
  
    track(target, key)
    if (isObject(res)) {
      return reactive(res)
    }
    return res
  }
}

const set = createSetter()
function createSetter() {
  return function set(target: object, key: string | symbol, value: any, receiver: object) {
    const res = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return res
  }
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}