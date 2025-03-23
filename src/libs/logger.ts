/* eslint-disable @typescript-eslint/no-explicit-any, no-console */

const logger = {
  log: (...messages: any[]) => console.log(...messages),
  error: (...messages: any[]) => console.error(...messages),
  warn: (...messages: any[]) => console.warn(...messages),
};

export default logger;
