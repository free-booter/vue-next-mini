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

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

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

    var hasChanged = function (value, oldValue) { return !Object.is(value, oldValue); };
    var isFunction = function (val) {
        return typeof val === 'function';
    };
    var extend = Object.assign;

    var createDep = function (effects) {
        return new Set(effects);
    };

    var targetMap = new WeakMap();
    function effect(fn, options) {
        var _effect = new ReactiveEffect(fn);
        if (options) {
            extend(_effect, options);
        }
        if (!options || !options.lazy) {
            _effect.run();
        }
    }
    var activeEffect;
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn, scheduler) {
            if (scheduler === void 0) { scheduler = null; }
            this.fn = fn;
            this.scheduler = scheduler;
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
        var e_1, _a, e_2, _b;
        var effects = Array.isArray(dep) ? dep : __spreadArray([], __read(dep), false);
        try {
            for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                var effect_1 = effects_1_1.value;
                if (effect_1.computed) {
                    triggerEffect(effect_1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (effects_1_1 && !effects_1_1.done && (_a = effects_1.return)) _a.call(effects_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var effects_2 = __values(effects), effects_2_1 = effects_2.next(); !effects_2_1.done; effects_2_1 = effects_2.next()) {
                var effect_2 = effects_2_1.value;
                if (!effect_2.computed) {
                    triggerEffect(effect_2);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (effects_2_1 && !effects_2_1.done && (_b = effects_2.return)) _b.call(effects_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    function triggerEffect(effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
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

    var ReactiveFlags;
    (function (ReactiveFlags) {
        ReactiveFlags["SKIP"] = "__v_skip";
        ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
        ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
        ReactiveFlags["IS_SHALLOW"] = "__v_isShallow";
        ReactiveFlags["RAW"] = "__v_raw";
        ReactiveFlags["IS_REF"] = "__v_isRef";
    })(ReactiveFlags || (ReactiveFlags = {}));

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
        proxy[ReactiveFlags.IS_REACTIVE] = true;
        //3.将proxy保存到map
        reactiveMap.set(target, proxy);
        return proxy;
    }
    var isReactive = function (value) { return !!value[ReactiveFlags.IS_REACTIVE]; };

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

    var _a;
    function computed(getterOrOptions) {
        var getter;
        var setter;
        // 判断是否为函数
        if (isFunction(getterOrOptions)) {
            getter = getterOrOptions;
        }
        else {
            getter = getterOrOptions.get;
            setter = getterOrOptions.set;
        }
        var cRef = new ComputedRefImpl(getter, setter);
        return cRef;
    }
    var ComputedRefImpl = /** @class */ (function () {
        function ComputedRefImpl(fn, setter) {
            var _this = this;
            this.fn = fn;
            this.setter = setter;
            this.dep = undefined;
            this.__v_isRef = true;
            this[_a] = true;
            this._dirty = true;
            this.effect = new ReactiveEffect(fn, function () {
                if (!_this._dirty) {
                    _this._dirty = true;
                    triggerRefValue(_this);
                }
            });
            this.effect.computed = this;
        }
        Object.defineProperty(ComputedRefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                if (this._dirty) {
                    this._dirty = false;
                    this._value = this.effect.run();
                }
                return this._value;
            },
            set: function (val) {
                if (this.__v_isReadonly) {
                    console.warn('Write operation failed: computed value is readonly', val);
                }
            },
            enumerable: false,
            configurable: true
        });
        return ComputedRefImpl;
    }());
    _a = ReactiveFlags.IS_READONLY;

    // 调度器（更改执行顺序、执行规则）
    var pendingPreFlushCbs = [];
    var isFlushPending = false;
    var resolvedPromise = Promise.resolve();
    function queuePreFlushCb(cb) {
        queueCb(cb, pendingPreFlushCbs);
    }
    function queueCb(cb, pendingQueue) {
        pendingQueue.push(cb);
        queueFlush();
    }
    function queueFlush() {
        if (!isFlushPending) {
            isFlushPending = true;
            resolvedPromise.then(flushJobs);
        }
    }
    function flushJobs() {
        isFlushPending = false;
        flushPreFlushCbs();
    }
    function flushPreFlushCbs() {
        if (pendingPreFlushCbs.length) {
            var activePreFlushCbs = __spreadArray([], __read(new Set(pendingPreFlushCbs)), false);
            pendingPreFlushCbs.length = 0;
            for (var i = 0; i < activePreFlushCbs.length; i++) {
                activePreFlushCbs[i]();
            }
        }
    }

    function watch(source, cb, options) {
        return doWatch(source, cb, options);
    }
    function doWatch(source, cb, _a) {
        var _b = _a === void 0 ? {} : _a, immediate = _b.immediate, deep = _b.deep;
        var getter;
        if (isReactive(source)) {
            getter = function () { return source; };
            deep = true;
        }
        else {
            getter = function () { };
        }
        var oldValue = {};
        var job = function () {
            if (cb) {
                var newValue = effect.run();
                if (deep || hasChanged(oldValue, newValue)) {
                    cb(newValue, oldValue);
                    oldValue = newValue;
                }
            }
        };
        if (cb && deep) {
            var baseGetter_1 = getter;
            getter = function () { return traverse(baseGetter_1()); };
        }
        var scheduler = function () { return queuePreFlushCb(job); };
        var effect = new ReactiveEffect(getter, scheduler);
        if (cb) {
            if (immediate) {
                job();
            }
            else {
                oldValue = effect.run();
            }
        }
        else {
            effect.run();
        }
    }
    function traverse(value, seen) {
        if (seen === void 0) { seen = new Set(); }
        if (!isObject(value))
            return value;
        if (seen.has(value))
            return value;
        seen.add(value);
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                traverse(value[i], seen);
            }
        }
        else {
            for (var key in value) {
                traverse(value[key], seen);
            }
        }
        return value;
    }

    exports.computed = computed;
    exports.effect = effect;
    exports.queuePreFlushCb = queuePreFlushCb;
    exports.reactive = reactive;
    exports.ref = ref;
    exports.watch = watch;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=vue.js.map
