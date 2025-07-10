import { promises as fs } from 'fs';
import { join } from 'path';

// 서버 로그 엔트리 인터페이스
export interface ServerLogEntry {
  timestamp: string;
  level: string;
  prefix: string;
  message: string;
  data?: any;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
}

// 로그 레벨
export enum ServerLogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class ServerLogger {
  private logsDir: string;
  private logCache: Map<string, ServerLogEntry[]> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly maxCacheSize = 100; // 캐시에 최대 100개 로그 저장
  private readonly flushInterval = 5000; // 5초마다 플러시

  constructor(logsDir: string = 'logs') {
    this.logsDir = join(process.cwd(), logsDir);
    this.initializeLogger();
  }

  // 로거 초기화
  private async initializeLogger() {
    try {
      // logs 디렉터리 생성 (없는 경우)
      await fs.mkdir(this.logsDir, { recursive: true });
      
      // 자동 플러시 타이머 시작
      this.startFlushTimer();
      
      console.log(`[ServerLogger] 초기화 완료: ${this.logsDir}`);
    } catch (error) {
      console.error('[ServerLogger] 초기화 실패:', error);
    }
  }

  // 날짜별 파일명 생성
  private getLogFileName(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `chatbot-${year}-${month}-${day}.log`;
  }

  // 로그 파일 경로 생성
  private getLogFilePath(date: Date = new Date()): string {
    return join(this.logsDir, this.getLogFileName(date));
  }

  // 자동 플러시 타이머 시작
  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  // 캐시된 로그를 파일에 플러시
  private async flushLogs() {
    for (const [dateKey, logs] of this.logCache.entries()) {
      if (logs.length === 0) continue;

      try {
        const date = new Date(dateKey);
        const filePath = this.getLogFilePath(date);
        
        // 로그를 JSON Lines 형식으로 변환
        const logLines = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
        
        // 파일에 추가 (append)
        await fs.appendFile(filePath, logLines, 'utf8');
        
        // 캐시에서 제거
        this.logCache.set(dateKey, []);
        
        console.log(`[ServerLogger] ${logs.length}개 로그를 ${this.getLogFileName(date)}에 저장`);
      } catch (error) {
        console.error(`[ServerLogger] 로그 저장 실패 (${dateKey}):`, error);
      }
    }
  }

  // 로그 추가
  async log(entry: ServerLogEntry) {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    // 타임스탬프가 없으면 현재 시간 설정
    if (!entry.timestamp) {
      entry.timestamp = now.toISOString();
    }

    // 캐시에 로그 추가
    if (!this.logCache.has(dateKey)) {
      this.logCache.set(dateKey, []);
    }
    
    const logs = this.logCache.get(dateKey)!;
    logs.push(entry);

    // 캐시 크기가 초과하면 즉시 플러시
    if (logs.length >= this.maxCacheSize) {
      await this.flushLogs();
    }
  }

  // 편의 메서드들
  async info(prefix: string, message: string, data?: any, metadata?: Partial<ServerLogEntry>) {
    await this.log({
      level: 'INFO',
      prefix,
      message,
      data,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  async warn(prefix: string, message: string, data?: any, metadata?: Partial<ServerLogEntry>) {
    await this.log({
      level: 'WARN',
      prefix,
      message,
      data,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  async error(prefix: string, message: string, error?: any, metadata?: Partial<ServerLogEntry>) {
    await this.log({
      level: 'ERROR',
      prefix,
      message,
      data: error,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  // 즉시 플러시
  async flush() {
    await this.flushLogs();
  }

  // 소멸자 - 남은 로그 플러시
  async destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // 남은 캐시 모두 플러시
    await this.flushLogs();
  }
}

// 싱글톤 인스턴스
let serverLoggerInstance: ServerLogger | null = null;

export function getServerLogger(): ServerLogger {
  if (!serverLoggerInstance) {
    serverLoggerInstance = new ServerLogger();
  }
  return serverLoggerInstance;
}

// 프로세스 종료 시 로그 플러시
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    serverLoggerInstance?.flush();
  });
  
  process.on('SIGINT', async () => {
    await serverLoggerInstance?.destroy();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await serverLoggerInstance?.destroy();
    process.exit(0);
  });
}

export default getServerLogger; 