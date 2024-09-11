let person = {
  name: "张三",
  age: 18,
  friends: [
    { name: "李四", age: 19 },
    { name: "王五", age: 20 },
  ],
  address: "北京",
  brands: ["苹果", "华为"],
};

const isObject = (val) => typeof val === "object" && val !== null;

const baseHandler = {
  get(target, key) {
    const res = Reflect.get(target, key);
    if (isObject(res)) {
      return deepProxy(res, baseHandler);
    }
    console.log("get", key);
    return res;
  },
  set(target, key, value) {
    console.log("set", key, value);
    return Reflect.set(target, key, value);
  },
};

const deepProxy = (target, handler) => {
  const proxy = new Proxy(target, handler);
  return proxy;
};
const personProxy = deepProxy(person, baseHandler);
person.brands.push('小米')