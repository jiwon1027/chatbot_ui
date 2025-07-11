// 간단한 API 로깅 전용 로거

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

class ApiLogger {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  // 타임스탬프 생성
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  // 로그 레벨 체크
  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  // 콘솔 출력 (파일명도 표시)
  private outputToConsole(level: string, category: string, message: string, data?: any) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${category} ${level}] ${timestamp} - ${message}`;
    
    switch (level) {
      case 'DEBUG':
        console.debug(logMessage, data);
        break;
      case 'INFO':
        console.info(logMessage, data);
        break;
      case 'WARN':
        console.warn(logMessage, data);
        break;
      case 'ERROR':
        console.error(logMessage, data);
        break;
      default:
        console.log(logMessage, data);
    }
  }

  // DEBUG 로그
  debug(category: string, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.outputToConsole('DEBUG', category, message, data);
  }

  // INFO 로그
  info(category: string, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.outputToConsole('INFO', category, message, data);
  }

  // WARN 로그
  warn(category: string, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    this.outputToConsole('WARN', category, message, data);
  }

  // ERROR 로그
  error(category: string, message: string, error?: any) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    let errorData = error;
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    this.outputToConsole('ERROR', category, message, errorData);
  }

  // API 호출 로그 (성공)
  logApiCall(endpoint: string, method: string, duration: number, data?: any) {
    this.info('API', `${method} ${endpoint} - ${duration}ms`, {
      endpoint,
      method,
      duration,
      response: data
    });
  }

  // API 에러 로그
  logApiError(endpoint: string, method: string, error: any, duration?: number) {
    this.error('API', `${method} ${endpoint} 실패${duration ? ` - ${duration}ms` : ''}`, {
      endpoint,
      method,
      duration,
      error
    });
  }

  // 로그 레벨 변경
  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }
}

// 기본 로거 인스턴스 생성
const apiLogger = new ApiLogger(
  import.meta.env.MODE === 'production' ? LogLevel.WARN : LogLevel.DEBUG
);

export default apiLogger; 