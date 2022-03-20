const envCache: Record<string, any> = {};

const accessEnv = (key: string, defaultValue?: any) => {
  if (!(key in process.env)) {
    if (defaultValue) return defaultValue;
    throw new Error(`${key} not found in process.env!`);
  }

  if (envCache[key]) return envCache[key];

  envCache[key] = process.env[key];

  return envCache[key];
};

export default accessEnv;
