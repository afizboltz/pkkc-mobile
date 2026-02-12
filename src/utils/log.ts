export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal'
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    category: string;
    message: string;
    data?: any;
    userId?: string;
    sessionId?: string;
    deviceInfo?: DeviceInfo;
    stackTrace?: string;
}

export interface DeviceInfo {
    platform: string;
    version: string;
    buildNumber?: string;
    appVersion: string;
    isEmulator?: boolean;
}

export interface ErrorReport {
    errorId: string;
    timestamp: string;
    errorMessage: string;
    errorStack?: string;
    userId?: string;
    userEmail?: string;
    action: string;
    context: any;
    deviceInfo: DeviceInfo;
    reproductionSteps?: string[];
    userFeedback?: string;
}

// Enhanced logging utility
export const printLog = (title: string, message?: string | object | boolean, level: LogLevel = LogLevel.INFO) => {
    if (__DEV__) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${title}: ${JSON.stringify(message, null, 3)}`;

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(logMessage);
                break;
            case LogLevel.INFO:
                console.info(logMessage);
                break;
            case LogLevel.WARN:
                console.warn(logMessage);
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(logMessage);
                break;
            default:
                console.log(logMessage);
        }
    }
};

// Structured logging for production
export const logEvent = async (
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    userId?: string
): Promise<void> => {
    const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        data,
        userId,
        sessionId: getSessionId(),
        deviceInfo: await getDeviceInfo()
    };

    // In development, still log to console
    if (__DEV__) {
        printLog(`${category} [${level.toUpperCase()}]`, { message, data }, level);
    }

    // In production, send to logging service
    if (!__DEV__) {
        try {
            await sendToLoggingService(logEntry);
        } catch (err) {
            // Fallback to console if logging service fails
            console.error('Failed to send log to service:', err);
        }
    }
};

// Convenience methods
export const logDebug = (category: string, message: string, data?: any, userId?: string) =>
    logEvent(LogLevel.DEBUG, category, message, data, userId);

export const logInfo = (category: string, message: string, data?: any, userId?: string) =>
    logEvent(LogLevel.INFO, category, message, data, userId);

export const logWarn = (category: string, message: string, data?: any, userId?: string) =>
    logEvent(LogLevel.WARN, category, message, data, userId);

export const logError = (category: string, message: string, error?: Error, data?: any, userId?: string) => {
    const errorData = {
        ...data,
        errorMessage: error?.message,
        errorStack: error?.stack
    };
    logEvent(LogLevel.ERROR, category, message, errorData, userId);
};

export const logFatal = (category: string, message: string, error?: Error, data?: any, userId?: string) => {
    const errorData = {
        ...data,
        errorMessage: error?.message,
        errorStack: error?.stack
    };
    logEvent(LogLevel.FATAL, category, message, errorData, userId);
};

// Generate unique session ID
const getSessionId = (): string => {
    // This would typically be stored in persistent storage
    // For now, generate a simple session ID
    if (typeof window !== 'undefined' && window.sessionStorage) {
        let sessionId = window.sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            window.sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get device information
const getDeviceInfo = async (): Promise<DeviceInfo> => {
    try {
        // In React Native, you'd use DeviceInfo or similar
        // For now, return basic info
        return {
            platform: 'unknown', // Would be Platform.OS in React Native
            version: 'unknown',  // Would be Platform.Version
            appVersion: '1.0.0', // Would be from app.json or Constants.manifest.version
            isEmulator: false   // Would be from DeviceInfo.isEmulator()
        };
    } catch (err) {
        return {
            platform: 'unknown',
            version: 'unknown',
            appVersion: '1.0.0',
            isEmulator: false
        };
    }
};

// Send logs to logging service (Firebase or other)
const sendToLoggingService = async (logEntry: LogEntry): Promise<void> => {
    try {
        // Import and use the error logging service
        const { errorLoggingService } = await import('../services/errorLogging');
        await errorLoggingService.logEntry(logEntry);
    } catch (error) {
        console.error('Failed to send log to service:', error);
        // Fallback: store locally for later sync
        console.log('Log entry ready for service:', logEntry);
    }
};

// Error reporting for user feedback
export const createErrorReport = async (
    error: Error,
    action: string,
    context: any,
    userId?: string,
    userEmail?: string
): Promise<ErrorReport> => {
    const errorReport: ErrorReport = {
        errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        errorMessage: error.message,
        errorStack: error.stack,
        userId,
        userEmail,
        action,
        context,
        deviceInfo: await getDeviceInfo()
    };

    // Log the error report
    await logError('ERROR_REPORT', `Error in ${action}`, error, { errorReport }, userId);

    return errorReport;
};

// Performance logging
export const logPerformance = async (action: string, startTime: number, data?: any) => {
    const duration = Date.now() - startTime;
    await logInfo('PERFORMANCE', `${action} completed in ${duration}ms`, {
        action,
        duration,
        ...data
    });
};

// User action logging
export const logUserAction = async (action: string, data?: any, userId?: string) => {
    await logInfo('USER_ACTION', `User performed: ${action}`, data, userId);
};