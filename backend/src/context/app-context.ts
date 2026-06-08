import { AsyncLocalStorage } from 'async_hooks';

export interface AppContextData {
  correlationId: string;
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  deviceId?: string;
  requestPath?: string;
  requestMethod?: string;
  startTime?: number;
}

export const appContext = new AsyncLocalStorage<AppContextData>();

export const getContext = (): AppContextData => {
  const ctx = appContext.getStore();
  if (!ctx) {
    return { correlationId: 'no-context' };
  }
  return ctx;
};

export const setContextValue = <K extends keyof AppContextData>(
  key: K,
  value: AppContextData[K]
): void => {
  const ctx = appContext.getStore();
  if (ctx) {
    (ctx as any)[key] = value;
  }
};
