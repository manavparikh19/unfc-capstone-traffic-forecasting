type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
};

function writeLog(entry: LogEntry) {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const payload = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    writeLog({ level: "debug", message, context });
  },
  info(message: string, context?: Record<string, unknown>) {
    writeLog({ level: "info", message, context });
  },
  warn(message: string, context?: Record<string, unknown>) {
    writeLog({ level: "warn", message, context });
  },
  error(message: string, context?: Record<string, unknown>) {
    writeLog({ level: "error", message, context });
  },
};
