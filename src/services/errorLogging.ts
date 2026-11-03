import { supabase } from '../config/supabase';
import type { Json } from '../types/supabase';
import { ErrorReport, LogEntry, LogLevel } from '../utils/log';

class ErrorLoggingService {
  private readonly ERROR_TABLE = 'error_logs';
  private readonly REPORT_TABLE = 'error_reports';

  // Log structured log entry to Supabase
  public logEntry = async (logEntry: LogEntry): Promise<void> => {
    try {
      const { error } = await supabase.from(this.ERROR_TABLE).insert({
        timestamp: logEntry.timestamp,
        level: logEntry.level,
        category: logEntry.category,
        message: logEntry.message,
        data: logEntry.data ?? null,
        user_id: logEntry.userId ?? null,
        session_id: logEntry.sessionId ?? null,
        device_info: (logEntry.deviceInfo ?? null) as Json,
        stack_trace: logEntry.stackTrace ?? null,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Failed to log entry to Supabase:', error);
      throw error;
    }
  };

  // Log error report to Supabase
  public logErrorReport = async (errorReport: ErrorReport): Promise<void> => {
    try {
      const { error } = await supabase.from(this.REPORT_TABLE).insert({
        error_id: errorReport.errorId,
        timestamp: errorReport.timestamp,
        error_message: errorReport.errorMessage,
        error_stack: errorReport.errorStack ?? null,
        user_id: errorReport.userId ?? null,
        user_email: errorReport.userEmail ?? null,
        action: errorReport.action,
        context: errorReport.context ?? null,
        device_info: errorReport.deviceInfo as unknown as Json,
        reproduction_steps: errorReport.reproductionSteps?.join('\n') ?? null,
        user_feedback: errorReport.userFeedback ?? null,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Failed to log error report to Supabase:', error);
      throw error;
    }
  };

  // Get recent errors for a user
  public getUserErrors = async (userId: string, limitCount: number = 20): Promise<LogEntry[]> => {
    try {
      const { data, error } = await supabase
        .from(this.ERROR_TABLE)
        .select('*')
        .eq('user_id', userId)
        .in('level', [LogLevel.ERROR, LogLevel.FATAL])
        .order('timestamp', { ascending: false })
        .limit(limitCount);

      if (error) throw error;
      return (data ?? []).map((row) => ({
        timestamp: row.timestamp,
        level: row.level as LogLevel,
        category: row.category ?? '',
        message: row.message ?? '',
        data: row.data,
        userId: row.user_id ?? undefined,
        sessionId: row.session_id ?? undefined,
        deviceInfo: row.device_info as unknown as LogEntry['deviceInfo'],
        stackTrace: row.stack_trace ?? undefined,
      }));
    } catch (error) {
      console.error('Failed to get user errors:', error);
      return [];
    }
  };

  // Get error reports for analysis
  public getErrorReports = async (limitCount: number = 50): Promise<ErrorReport[]> => {
    try {
      const { data, error } = await supabase
        .from(this.REPORT_TABLE)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limitCount);

      if (error) throw error;
      return (data ?? []).map((row) => ({
        errorId: row.error_id ?? row.id,
        timestamp: row.timestamp,
        errorMessage: row.error_message ?? '',
        errorStack: row.error_stack ?? undefined,
        userId: row.user_id ?? undefined,
        userEmail: row.user_email ?? undefined,
        action: row.action ?? '',
        context: row.context,
        deviceInfo: row.device_info as unknown as ErrorReport['deviceInfo'],
        reproductionSteps: row.reproduction_steps ? row.reproduction_steps.split('\n') : undefined,
        userFeedback: row.user_feedback ?? undefined,
      }));
    } catch (error) {
      console.error('Failed to get error reports:', error);
      return [];
    }
  };

  // Get error statistics
  public getErrorStats = async (userId?: string): Promise<{
    totalErrors: number;
    errorByLevel: Record<LogLevel, number>;
    errorByCategory: Record<string, number>;
    recentErrors: LogEntry[];
  }> => {
    try {
      let q = supabase
        .from(this.ERROR_TABLE)
        .select('*')
        .in('level', [LogLevel.ERROR, LogLevel.FATAL])
        .order('timestamp', { ascending: false })
        .limit(100);

      if (userId) {
        q = q.eq('user_id', userId);
      }

      const { data, error } = await q;
      if (error) throw error;
      const errors = (data ?? []) as Array<{ level: string; category: string | null }>;

      const errorByLevel = errors.reduce((acc, row) => {
        const level = row.level as LogLevel;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<LogLevel, number>);

      const errorByCategory = errors.reduce((acc, row) => {
        const category = row.category ?? 'unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalErrors: errors.length,
        errorByLevel,
        errorByCategory,
        recentErrors: (data ?? []).slice(0, 10).map((row: any) => ({
          timestamp: row.timestamp,
          level: row.level as LogLevel,
          category: row.category ?? '',
          message: row.message ?? '',
          data: row.data,
          userId: row.user_id ?? undefined,
          sessionId: row.session_id ?? undefined,
          deviceInfo: row.device_info,
          stackTrace: row.stack_trace ?? undefined,
        })),
      };
    } catch (error) {
      console.error('Failed to get error stats:', error);
      return {
        totalErrors: 0,
        errorByLevel: {} as Record<LogLevel, number>,
        errorByCategory: {},
        recentErrors: [],
      };
    }
  };
}

// Export singleton instance
export const errorLoggingService = new ErrorLoggingService();

// Export convenience functions
export const logToSupabase = errorLoggingService.logEntry;
export const logErrorReport = errorLoggingService.logErrorReport;
export const getUserErrors = errorLoggingService.getUserErrors;
export const getErrorReports = errorLoggingService.getErrorReports;
export const getErrorStats = errorLoggingService.getErrorStats;
