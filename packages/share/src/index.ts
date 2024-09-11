export const isArray = Array.isArray
export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)
