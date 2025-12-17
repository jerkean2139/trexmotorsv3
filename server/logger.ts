type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  dealershipId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  error?: Error | unknown;
  [key: string]: unknown;
}

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  context?: LogContext;
  stack?: string;
}

class Logger {
  private service = 'trex-motors-api';
  private environment = process.env.NODE_ENV || 'development';

  private formatLog(level: LogLevel, message: string, context?: LogContext): StructuredLog {
    const log: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      environment: this.environment,
    };

    if (context) {
      if (context.error instanceof Error) {
        log.stack = context.error.stack;
        log.context = {
          ...context,
          error: {
            name: context.error.name,
            message: context.error.message,
          },
        };
      } else {
        log.context = context;
      }
    }

    return log;
  }

  private output(log: StructuredLog): void {
    const logFn = log.level === 'error' ? console.error : 
                  log.level === 'warn' ? console.warn : 
                  log.level === 'debug' ? console.debug : console.log;
    
    if (this.environment === 'production') {
      logFn(JSON.stringify(log));
    } else {
      const prefix = `[${log.level.toUpperCase()}]`;
      const contextStr = log.context ? ` ${JSON.stringify(log.context)}` : '';
      logFn(`${log.timestamp} ${prefix} ${log.message}${contextStr}`);
      if (log.stack) {
        console.error(log.stack);
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.output(this.formatLog('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    this.output(this.formatLog('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.output(this.formatLog('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    this.output(this.formatLog('error', message, context));
  }

  httpRequest(req: { method: string; path: string; ip?: string }, res: { statusCode: number }, duration: number): void {
    const level: LogLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    this.output(this.formatLog(level, `${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
    }));
  }
}

export const logger = new Logger();
