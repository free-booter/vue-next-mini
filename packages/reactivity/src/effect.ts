import { createDep, Dep } from "./dep"

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

// 存储正在运行的effect
export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

export let activeEffect: ReactiveEffect | undefined
export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) { }

  run() {
    activeEffect = this
    return this.fn()
  }
}

/**
 * 收集依赖
 * @param target - 目标对象
 * @param key - 对象的key
 */
export function track(target: object, key: unknown) {
  if (!activeEffect) return
  // 判断是否已经存在
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  trackEffects(dep)
}

export function trackEffects(dep){
  dep.add(activeEffect)
}

/**
 * 触发依赖
 * @param target - 目标对象 
 * @param key - 对象的key
 * @param newValue - 新值
 * @param oldValue 
 */
export function trigger(target: object, key: string | symbol) {
  // 判断是否存在
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep: Dep | undefined = depsMap.get(key)
  if(!dep) return
  triggerEffects(dep)
}

export function triggerEffects(dep: Dep) {
  const effects = Array.isArray(dep) ? dep : [...dep]
  effects.forEach(effect => {
    triggerEffect(effect)
  })
}

export function triggerEffect(effect: ReactiveEffect) {
  effect.run()
}