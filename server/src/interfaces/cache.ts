import cache from "memory-cache";

export const invalidateCache = () => {
  cache.clear();
};

export const standardCacheVariable = (key: string, value: any) => {
  cache.put(key, value, 1000 * 60 * 60 * 16, () => {
    console.log(`object ${key} invalidated after 16h`);
  });
};

export const standardAccessCache = (
  key: string,
  fallbackFunction: () => any
) => {
  const cachedValue = cache.get(key);
  if (cachedValue) {
    return cachedValue;
  } else {
    const value = fallbackFunction();
    standardCacheVariable(key, value);
    return value;
  }
};

export const invalidateSingeKeyInCache = (key: string) => {
  cache.del(key);
};
