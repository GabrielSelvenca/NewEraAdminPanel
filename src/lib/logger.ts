/**
 * Logger condicional - só loga em desenvolvimento
 */
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) },
  error: (...args: unknown[]) => {
    if (isDev) },
  warn: (...args: unknown[]) => {
    if (isDev) },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
};

export default logger;
