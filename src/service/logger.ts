export type Log = string | Record<string, unknown>

export interface Logger {
  trace: (msg: Log) => void;
  debug: (msg: Log) => void;
  info: (msg: Log) => void;
  warn: (msg: Log) => void;
  error: (msg: Log) => void;
  fatal: (msg: Log) => void;
}
