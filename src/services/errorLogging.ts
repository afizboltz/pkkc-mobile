import { addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ErrorReport, LogEntry, LogLevel } from '../utils/log';

class ErrorLoggingService {
  private readonly ERROR_COLLECTION = 'error_logs';
  private readonly REPORT_COLLECTION = 'error_reports';

  // Log structured log entry to Firebase
  public logEntry = async (logEntry: LogEntry): Promise<void> => {
    try {
      const docRef = collection(db, this.ERROR_COLLECTION);
      await addDoc(docRef, {
        ...logEntry,
        timestamp: serverTimestamp(),
        syncedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to log entry to Firebase:', error);
      throw error;
    }
  };

  // Log error report to Firebase
  public logErrorReport = async (errorReport: ErrorReport): Promise<void> => {
    try {
      const docRef = collection(db, this.REPORT_COLLECTION);
      await addDoc(docRef, {
        ...errorReport,
        timestamp: serverTimestamp(),
        syncedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to log error report to Firebase:', error);
      throw error;
    }
  };

  // Get recent errors for a user
  public getUserErrors = async (userId: string, limitCount: number = 20): Promise<LogEntry[]> => {
    try {
      const q = query(
        collection(db, this.ERROR_COLLECTION),
        where('userId', '==', userId),
        where('level', 'in', [LogLevel.ERROR, LogLevel.FATAL]),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
      })) as unknown as LogEntry[];
    } catch (error) {
      console.error('Failed to get user errors:', error);
      return [];
    }
  };

  // Get error reports for analysis
  public getErrorReports = async (limitCount: number = 50): Promise<ErrorReport[]> => {
    try {
      const q = query(
        collection(db, this.REPORT_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
      })) as unknown as ErrorReport[];
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
      let constraints = [
        where('level', 'in', [LogLevel.ERROR, LogLevel.FATAL]),
        orderBy('timestamp', 'desc'),
        limit(100)
      ];

      if (userId) {
        constraints.unshift(where('userId', '==', userId));
      }

      const q = query(
        collection(db, this.ERROR_COLLECTION),
        ...constraints
      );

      const querySnapshot = await getDocs(q);
      const errors = querySnapshot.docs.map(doc => doc.data()) as LogEntry[];

      const errorByLevel = errors.reduce((acc, error) => {
        acc[error.level] = (acc[error.level] || 0) + 1;
        return acc;
      }, {} as Record<LogLevel, number>);

      const errorByCategory = errors.reduce((acc, error) => {
        acc[error.category] = (acc[error.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalErrors: errors.length,
        errorByLevel,
        errorByCategory,
        recentErrors: errors.slice(0, 10)
      };
    } catch (error) {
      console.error('Failed to get error stats:', error);
      return {
        totalErrors: 0,
        errorByLevel: {} as Record<LogLevel, number>,
        errorByCategory: {},
        recentErrors: []
      };
    }
  };

  // Mark error as resolved
  public markErrorAsResolved = async (errorId: string, resolutionNote?: string): Promise<void> => {
    try {
      const docRef = doc(db, this.REPORT_COLLECTION, errorId);
      await addDoc(collection(db, 'error_resolutions'), {
        errorId,
        resolutionNote,
        resolvedAt: serverTimestamp(),
        resolvedBy: 'system' // Could be user ID in real implementation
      });
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
      throw error;
    }
  };
}

// Export singleton instance
export const errorLoggingService = new ErrorLoggingService();

// Export convenience functions
export const logToFirebase = errorLoggingService.logEntry;
export const logErrorReport = errorLoggingService.logErrorReport;
export const getUserErrors = errorLoggingService.getUserErrors;
export const getErrorReports = errorLoggingService.getErrorReports;
export const getErrorStats = errorLoggingService.getErrorStats;
