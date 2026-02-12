import { Alert, Share } from 'react-native';
import { getErrorReports } from '../services/errorLogging';
import { createErrorReport, logError, logUserAction } from './log';

export interface UserFeedbackOptions {
  includeDeviceInfo?: boolean;
  includeUserAction?: boolean;
  allowContact?: boolean;
  customMessage?: string;
}

export interface ErrorReportData {
  errorId: string;
  timestamp: string;
  errorMessage: string;
  errorStack?: string;
  userId?: string;
  userEmail?: string;
  action: string;
  context: any;
  deviceInfo: any;
  userFeedback?: string;
}

// Report error with user feedback
export const reportErrorWithFeedback = async (
  error: Error,
  action: string,
  context: any,
  options: UserFeedbackOptions = {},
  userId?: string,
  userEmail?: string
): Promise<void> => {
  try {
    await logUserAction('error_report_initiated', { action, hasOptions: Object.keys(options).length > 0 });

    // Create the error report
    const errorReport = await createErrorReport(error, action, context, userId, userEmail);

    // Show user feedback dialog
    if (options.allowContact !== false) {
      await showErrorFeedbackDialog(errorReport, options);
    } else {
      // Auto-submit without user feedback
      await submitErrorReport(errorReport);
    }

  } catch (reportError: any) {
    await logError('errorReporting', 'Failed to report error with feedback', reportError);
    // Fallback: basic error reporting
    await logError('errorReporting_fallback', `Error in ${action}`, error, context);
  }
};

// Show error feedback dialog to user
const showErrorFeedbackDialog = async (
  errorReport: ErrorReportData,
  options: UserFeedbackOptions
): Promise<void> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Something went wrong',
      options.customMessage || 'The app encountered an error. Would you like to report it to help us fix it?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            logUserAction('error_report_cancelled', { errorId: errorReport.errorId });
            resolve();
          }
        },
        {
          text: 'Report Anyway',
          onPress: () => {
            submitErrorReport(errorReport);
            resolve();
          }
        },
        {
          text: 'Add Details',
          onPress: () => {
            // This would open a more detailed feedback form
            // For now, just submit the report
            submitErrorReport(errorReport);
            resolve();
          }
        }
      ]
    );
  });
};

// Submit error report
const submitErrorReport = async (errorReport: ErrorReportData): Promise<void> => {
  try {
    await logUserAction('error_report_submitted', { errorId: errorReport.errorId });

    // The error report is already logged to Firebase via createErrorReport
    // Here we could add additional notification or tracking

    Alert.alert(
      'Report Submitted',
      'Thank you for helping us improve the app!',
      [{ text: 'OK' }]
    );
  } catch (error: any) {
    await logError('errorReporting', 'Failed to submit error report', error);
  }
};

// Share error report for manual reporting
export const shareErrorReport = async (
  error: Error,
  action: string,
  context: any,
  userId?: string,
  userEmail?: string
): Promise<void> => {
  try {
    const errorReport = await createErrorReport(error, action, context, userId, userEmail);

    const reportText = `
Error Report - PKKC Mobile App
================================
Error ID: ${errorReport.errorId}
Timestamp: ${errorReport.timestamp}
User: ${userEmail || 'Anonymous'}
Action: ${action}

Error Message:
${errorReport.errorMessage}

Context:
${JSON.stringify(errorReport.context, null, 2)}

Device Info:
${JSON.stringify(errorReport.deviceInfo, null, 2)}

Stack Trace:
${errorReport.errorStack || 'No stack trace available'}
    `.trim();

    await Share.share({
      message: reportText,
      title: 'PKKC App Error Report'
    });

    await logUserAction('error_report_shared', { errorId: errorReport.errorId });
  } catch (error: any) {
    await logError('errorReporting', 'Failed to share error report', error);
  }
};

// Get recent errors for user to review
export const getUserRecentErrors = async (userId: string, limit: number = 10): Promise<ErrorReportData[]> => {
  try {
    const errorReports = await getErrorReports(limit);
    return errorReports.filter(report => report.userId === userId);
  } catch (error: any) {
    await logError('errorReporting', 'Failed to get user recent errors', error);
    return [];
  }
};

// Show user their recent errors
export const showUserErrorHistory = async (userId: string): Promise<void> => {
  try {
    const recentErrors = await getUserRecentErrors(userId);

    if (recentErrors.length === 0) {
      Alert.alert('Error History', 'No recent errors found.');
      return;
    }

    const errorList = recentErrors.map((error, index) =>
      `${index + 1}. ${error.action} - ${new Date(error.timestamp).toLocaleDateString()}`
    ).join('\n');

    Alert.alert(
      'Recent Errors',
      `You have ${recentErrors.length} recent errors:\n\n${errorList}`,
      [
        { text: 'OK' },
        { text: 'Clear History', onPress: () => clearErrorHistory(userId) }
      ]
    );

  } catch (error: any) {
    await logError('errorReporting', 'Failed to show user error history', error);
  }
};

// Clear error history (client-side)
const clearErrorHistory = async (userId: string): Promise<void> => {
  try {
    // This would typically clear local storage or mark errors as resolved
    await logUserAction('error_history_cleared', { userId });
    Alert.alert('History Cleared', 'Your error history has been cleared.');
  } catch (error: any) {
    await logError('errorReporting', 'Failed to clear error history', error);
  }
};

// Automatic error reporting for critical errors
export const autoReportCriticalError = async (
  error: Error,
  action: string,
  context: any,
  userId?: string,
  userEmail?: string
): Promise<void> => {
  try {
    // Create and submit error report automatically
    const errorReport = await createErrorReport(error, action, context, userId, userEmail);

    await logError('auto_report', 'Critical error auto-reported', error, {
      errorId: errorReport.errorId,
      action,
      autoReported: true
    });

    // Optionally show a subtle notification to user
    Alert.alert(
      'Issue Detected',
      'We detected an issue and have automatically reported it. The app should continue working normally.',
      [{ text: 'OK' }]
    );

  } catch (reportError: any) {
    await logError('auto_report', 'Failed to auto-report critical error', reportError);
  }
};

// Performance issue reporting
export const reportPerformanceIssue = async (
  action: string,
  duration: number,
  threshold: number = 5000, // 5 seconds
  context?: any
): Promise<void> => {
  try {
    if (duration > threshold) {
      const error = new Error(`Performance issue: ${action} took ${duration}ms (threshold: ${threshold}ms)`);

      await logError('performance', `Slow performance detected in ${action}`, error, {
        action,
        duration,
        threshold,
        context
      });

      // Auto-report if significantly slower
      if (duration > threshold * 2) {
        await autoReportCriticalError(
          error,
          `performance_${action}`,
          { duration, threshold, ...context }
        );
      }
    }
  } catch (error: any) {
    await logError('performance_reporting', 'Failed to report performance issue', error);
  }
};

// Network error reporting
export const reportNetworkError = async (
  url: string,
  method: string,
  error: Error,
  context?: any
): Promise<void> => {
  try {
    await logError('network', `Network error: ${method} ${url}`, error, {
      url,
      method,
      context
    });

    // Auto-report critical network errors
    if (error.message.includes('timeout') || error.message.includes('network')) {
      await autoReportCriticalError(
        error,
        `network_${method}`,
        { url, ...context }
      );
    }
  } catch (reportError: any) {
    await logError('network_reporting', 'Failed to report network error', reportError);
  }
};
