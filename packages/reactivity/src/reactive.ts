import { mutableHandlers } from "./baseHandlers"

const reactiveMap = new WeakMap<object, any>()
export const isObject = (value: any) => value !== null && typeof value === 'object'
export const toReactive = (value: any) => isObject(value) ? reactive(value) : value


export function reactive(target: object) {
  // 判断是否是对象
  if (!isObject(target)) {
    console.warn('需要传入对象');
    return
  }
  return createReactiveObject(
    target,
    mutableHandlers,
    reactiveMap
  )
}

export function createReactiveObject(target: object, mutableHandlers: ProxyHandler<any>, reactiveMap: WeakMap<object, any>) {
  //1.判断target是否已经存在
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  //2.创建Proxy
  const proxy = new Proxy(target, mutableHandlers)
  //3.将proxy保存到map
  reactiveMap.set(target, proxy)
  return proxy
}

