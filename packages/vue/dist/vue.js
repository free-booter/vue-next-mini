var Vue = (function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var createDep = function (effects) {
        return new Set(effects);
    };

    var targetMap = new WeakMap();
    // 存储正在运行的effect
    function effect(fn) {
        var _effect = new ReactiveEffect(fn);
        _effect.run();
    }
    var activeEffect;
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn) {
            this.fn = fn;
        }
        ReactiveEffect.prototype.run = function () {
            activeEffect = this;
            return this.fn();
        };
        return ReactiveEffect;
    }());
    /**
     * 收集依赖
     * @param target - 目标对象
     * @param key - 对象的key
     */
    function track(target, key) {
        if (!activeEffect)
            return;
        // 判断是否已经存在
        var depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        var dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        trackEffects(dep);
    }
    function trackEffects(dep) {
        dep.add(activeEffect);
    }
    /**
     * 触发依赖
     * @param target - 目标对象
     * @param key - 对象的key
     * @param newValue - 新值
     * @param oldValue
     */
    function trigger(target, key) {
        // 判断是否存在
        var depsMap = targetMap.get(target);
        if (!depsMap)
            return;
        var dep = depsMap.get(key);
        if (!dep)
            return;
        triggerEffects(dep);
    }
    function triggerEffects(dep) {
        var effects = Array.isArray(dep) ? dep : __spreadArray([], __read(dep), false);
        effects.forEach(function (effect) {
            triggerEffect(effect);
        });
    }
    function triggerEffect(effect) {
        effect.run();
    }

    var get = createGetter();
    function createGetter() {
        return function get(target, key, receiver) {
            var res = Reflect.get(target, key, receiver);
            track(target, key);
            if (isObject(res)) {
                return reactive(res);
            }
            return res;
        };
    }
    var set = createSetter();
    function createSetter() {
        return function set(target, key, value, receiver) {
            var res = Reflect.set(target, key, value, receiver);
            trigger(target, key);
            return res;
        };
    }
    var mutableHandlers = {
        get: get,
        set: set
    };

    var reactiveMap = new WeakMap();
    var isObject = function (value) { return value !== null && typeof value === 'object'; };
    var toReactive = function (value) { return isObject(value) ? reactive(value) : value; };
    function reactive(target) {
        // 判断是否是对象
        if (!isObject(target)) {
            console.warn('需要传入对象');
            return;
        }
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    function createReactiveObject(target, mutableHandlers, reactiveMap) {
        //1.判断target是否已经存在
        var existingProxy = reactiveMap.get(target);
        if (existingProxy) {
            return existingProxy;
        }
        //2.创建Proxy
        var proxy = new Proxy(target, mutableHandlers);
        //3.将proxy保存到map
        reactiveMap.set(target, proxy);
        return proxy;
    }

    var hasChanged = function (value, oldValue) { return !Object.is(value, oldValue); };

    function ref(value) {
        return createRef(value);
    }
    function createRef(rawValue) {
        return new RefImpl(rawValue);
    }
    var RefImpl = /** @class */ (function () {
        function RefImpl(value, __v_isShallow) {
            if (__v_isShallow === void 0) { __v_isShallow = false; }
            this.__v_isShallow = __v_isShallow;
            this.dep = undefined;
            this.__v_isRef = true;
            this._rawValue = value;
            this._value = __v_isShallow ? value : toReactive(value);
        }
        Object.defineProperty(RefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                return this._value;
            },
            set: function (newValue) {
                // 判断是否改变
                if (hasChanged(newValue, this._rawValue)) {
                    this._rawValue = newValue;
                    this._value = this.__v_isShallow ? newValue : toReactive(newValue);
                    triggerRefValue(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        return RefImpl;
    }());
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    function triggerRefValue(ref, newVal) {
        if (ref.dep) {
            triggerEffects(ref.dep);
        }
    }

    exports.effect = effect;
    exports.reactive = reactive;
    exports.ref = ref;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=vue.js.map
