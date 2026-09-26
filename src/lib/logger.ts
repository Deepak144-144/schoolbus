import { NextRequest } from "next/server";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  requestId?: string;
}

class Logger {
  private isProduction = process.env.NODE_ENV === "production";
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || (this.isProduction ? "info" : "debug");

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private format(entry: LogEntry): string {
    const base = {
      timestamp: entry.timestamp,
      level: entry.level.toUpperCase(),
      message: entry.message,
      ...(entry.requestId && { requestId: entry.requestId }),
      ...(entry.context && { context: entry.context }),
    };
    return JSON.stringify(base);
  }

  debug(message: string, context?: Record<string, any>, requestId?: string) {
    if (!this.shouldLog("debug")) return;
    console.log(this.format({ level: "debug", message, timestamp: new Date().toISOString(), context, requestId }));
  }

  info(message: string, context?: Record<string, any>, requestId?: string) {
    if (!this.shouldLog("info")) return;
    console.log(this.format({ level: "info", message, timestamp: new Date().toISOString(), context, requestId }));
  }

  warn(message: string, context?: Record<string, any>, requestId?: string) {
    if (!this.shouldLog("warn")) return;
    console.warn(this.format({ level: "warn", message, timestamp: new Date().toISOString(), context, requestId }));
  }

  error(message: string, context?: Record<string, any>, requestId?: string) {
    if (!this.shouldLog("error")) return;
    console.error(this.format({ level: "error", message, timestamp: new Date().toISOString(), context, requestId }));
  }

  http(req: NextRequest, res: { statusCode: number }, duration: number, requestId?: string) {
    if (!this.shouldLog("info")) return;
    this.info("HTTP Request", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers.get("user-agent"),
    }, requestId);
  }
}

export const logger = new Logger();

export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}