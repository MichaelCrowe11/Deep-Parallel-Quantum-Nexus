import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  DEBUG = 'debug',
  WARNING = 'warning',
  SYSTEM = 'system'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
  userId?: string | number;
}

class Logger {
  private logDir: string;
  private logFile: string;
  private maxLogSize: number = 5 * 1024 * 1024; // 5MB
  private isProduction: boolean;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, 'deep-parallel.log');
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Create log directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // Create log file if it doesn't exist
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, '');
    }
  }

  private async writeToLog(entry: LogEntry): Promise<void> {
    try {
      // Format log entry
      const logString = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}\n`;
      
      // Write to log file
      fs.appendFileSync(this.logFile, logString);
      
      // Check log file size and rotate if needed
      this.checkLogSize();

      // Also write to console in non-production environments
      if (!this.isProduction || entry.level === LogLevel.ERROR) {
        const consoleMethod = entry.level === LogLevel.ERROR ? 'error' : 'log';
        console[consoleMethod](`[${entry.level.toUpperCase()}]`, entry.message);
        if (entry.details) {
          console[consoleMethod]('Details:', entry.details);
        }
      }
    } catch (error) {
      console.error('Error writing to log:', error);
    }
  }

  private checkLogSize(): void {
    try {
      const stats = fs.statSync(this.logFile);
      if (stats.size > this.maxLogSize) {
        // Rotate log file
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
        const rotatedLogFile = path.join(this.logDir, `deep-parallel-${timestamp}.log`);
        fs.renameSync(this.logFile, rotatedLogFile);
        fs.writeFileSync(this.logFile, '');
      }
    } catch (error) {
      console.error('Error checking log size:', error);
    }
  }

  public log(
    message: string, 
    level: LogLevel = LogLevel.INFO, 
    details?: any, 
    userId?: string | number
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
      userId
    };
    
    this.writeToLog(entry);
  }

  public info(message: string, details?: any, userId?: string | number): void {
    this.log(message, LogLevel.INFO, details, userId);
  }

  public error(message: string, details?: any, userId?: string | number): void {
    this.log(message, LogLevel.ERROR, details, userId);
  }

  public debug(message: string, details?: any, userId?: string | number): void {
    if (!this.isProduction) {
      this.log(message, LogLevel.DEBUG, details, userId);
    }
  }

  public warning(message: string, details?: any, userId?: string | number): void {
    this.log(message, LogLevel.WARNING, details, userId);
  }

  public system(message: string, details?: any): void {
    this.log(message, LogLevel.SYSTEM, details);
  }

  public getLogEntries(count: number = 100, level?: LogLevel): string[] {
    try {
      const fileContent = fs.readFileSync(this.logFile, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');
      
      let filteredLines = lines;
      if (level) {
        filteredLines = lines.filter(line => line.includes(`[${level.toUpperCase()}]`));
      }
      
      return filteredLines.slice(-count);
    } catch (error) {
      console.error('Error reading log file:', error);
      return [];
    }
  }
}

// Create singleton instance
const logger = new Logger();

export { logger };
export default logger;