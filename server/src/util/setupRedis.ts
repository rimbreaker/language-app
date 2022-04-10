import { createClient } from "redis";

const redisAddress = process.env.REDIS_URL;
const client = createClient(
  redisAddress
    ? {
        url: redisAddress,
      }
    : undefined
);

client.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
  await client.connect();
};

const cacheFor1Day = async (key: string, value: any) => {
  await client.setEx(key, 60 * 60 * 24, value);
};

const getFromCache = async (key: string, fallback: (...a: any) => any) => {
  if (await client.exists(key)) {
    const cachedValue = await client.get(key);
    if (cachedValue![0] === "{") return JSON.parse(cachedValue as string);
    else return cachedValue;
  } else {
    const returnValue = await fallback();
    cacheFor1Day(key, JSON.stringify(returnValue));
    return returnValue;
  }
};

export { connectRedis, getFromCache };
