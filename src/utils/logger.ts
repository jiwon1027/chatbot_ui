// 로그 레벨 정의
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// 로거 설정 인터페이스
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableTimestamp: boolean;
  prefix: string;
}

// 기본 설정
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableConsole: true,
  enableTimestamp: true,
  prefix: 'ChatBot'
};

// 로그 엔트리 인터페이스
interface LogEntry {
  timestamp: string;
  level: string;
  prefix: string;
  message: string;
  data?: any;
}

class Logger {
  private config: LoggerConfig;
  private sessionId: string;
  private timers: Map<string, number> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
  }

  // 세션 ID 생성
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 로그 레벨 체크
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  // 타임스탬프 생성
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  // 로그 포맷팅
  private formatLog(level: string, message: string, data?: any): LogEntry {
    return {
      timestamp: this.getTimestamp(),
      level,
      prefix: this.config.prefix,
      message,
      data
    };
  }

  // 콘솔 출력
  private outputToConsole(logEntry: LogEntry, consoleMethod: Function) {
    if (!this.config.enableConsole) return;

    const prefix = `[${logEntry.prefix} ${logEntry.level}]`;
    const timestamp = this.config.enableTimestamp ? ` ${logEntry.timestamp} -` : '';
    const logMessage = `${prefix}${timestamp} ${logEntry.message}`;

    if (logEntry.data !== undefined) {
      consoleMethod(logMessage, logEntry.data);
    } else {
      consoleMethod(logMessage);
    }
  }

  // DEBUG 레벨 로그
  debug(message: string, data?: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const logEntry = this.formatLog('DEBUG', message, data);
    this.outputToConsole(logEntry, console.debug);
  }

  // INFO 레벨 로그
  info(message: string, data?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const logEntry = this.formatLog('INFO', message, data);
    this.outputToConsole(logEntry, console.info);
  }

  // WARN 레벨 로그
  warn(message: string, data?: any) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const logEntry = this.formatLog('WARN', message, data);
    this.outputToConsole(logEntry, console.warn);
  }

  // ERROR 레벨 로그
  error(message: string, error?: any) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const logEntry = this.formatLog('ERROR', message, error);
    this.outputToConsole(logEntry, console.error);
  }

  // 시간 측정 시작
  time(label: string) {
    this.timers.set(label, Date.now());
    this.debug(`타이머 시작: ${label}`);
  }

  // 시간 측정 종료
  timeEnd(label: string) {
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.info(`타이머 종료: ${label} - ${duration}ms`);
      this.timers.delete(label);
    }
  }

  // 그룹 시작
  group(label: string) {
    this.info(`그룹 시작: ${label}`);
    if (this.config.enableConsole) {
      console.group(`[${this.config.prefix}] ${label}`);
    }
  }

  // 그룹 종료
  groupEnd() {
    if (this.config.enableConsole) {
      console.groupEnd();
    }
  }

  // 세션 ID 반환
  getSessionId(): string {
    return this.sessionId;
  }

  // 설정 업데이트
  updateConfig(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// 로거 생성 함수
export const createLogger = (prefix: string, config?: Partial<LoggerConfig>) => {
  return new Logger({ ...config, prefix });
};

// 기본 로거 인스턴스들
export const logger = new Logger();
export const apiLogger = createLogger('API');
export const uiLogger = createLogger('UI');
export const errorLogger = createLogger('ERROR');

// 운영 환경에서 로그 레벨 조정
if (process.env.NODE_ENV === 'production') {
  logger.updateConfig({ level: LogLevel.ERROR, enableConsole: false });
  apiLogger.updateConfig({ level: LogLevel.ERROR, enableConsole: false });
  uiLogger.updateConfig({ level: LogLevel.ERROR, enableConsole: false });
  errorLogger.updateConfig({ level: LogLevel.ERROR, enableConsole: true }); // 에러만 콘솔에 출력
} 