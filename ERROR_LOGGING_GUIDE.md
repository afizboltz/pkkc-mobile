# Error Logging System - PKKC Mobile App

This guide explains the comprehensive error logging system implemented for the PKKC mobile app to help you debug user issues effectively.

## Overview

The error logging system provides:
- **Structured logging** with different severity levels
- **Firebase integration** for centralized error collection
- **Performance tracking** for slow operations
- **User feedback mechanisms** for error reporting
- **Automatic error reporting** for critical issues

## Components

### 1. Enhanced Logging Utility (`src/utils/log.ts`)

#### Log Levels
- `DEBUG`: Detailed debugging information
- `INFO`: General information about app operations
- `WARN`: Warning messages for potential issues
- `ERROR`: Error messages that need attention
- `FATAL`: Critical errors that may crash the app

#### Key Functions
```typescript
// Basic logging
logInfo(category, message, data?, userId?)
logError(category, message, error?, data?, userId?)
logWarn(category, message, data?, userId?)
logFatal(category, message, error?, data?, userId?)

// Performance tracking
logPerformance(action, startTime, data?)

// User action logging
logUserAction(action, data?, userId?)

// Error reporting
createErrorReport(error, action, context, userId?, userEmail?)
```

### 2. Firebase Error Logging Service (`src/services/errorLogging.ts`)

Handles storing and retrieving error logs from Firebase Firestore.

#### Collections
- `error_logs`: Structured log entries
- `error_reports`: Detailed error reports
- `error_resolutions`: Marked as resolved errors

#### Key Functions
```typescript
// Store log entries
errorLoggingService.logEntry(logEntry)

// Get user errors
getUserErrors(userId, limit?)

// Get error statistics
getErrorStats(userId?)

// Get recent error reports
getErrorReports(limit?)
```

### 3. User Error Reporting (`src/utils/errorReporting.ts`)

Provides user-facing error reporting mechanisms.

#### Key Functions
```typescript
// Report error with user feedback
reportErrorWithFeedback(error, action, context, options?, userId?, userEmail?)

// Share error report
shareErrorReport(error, action, context, userId?, userEmail?)

// Auto-report critical errors
autoReportCriticalError(error, action, context, userId?, userEmail?)

// Performance issue reporting
reportPerformanceIssue(action, duration, threshold?, context?)

// Network error reporting
reportNetworkError(url, method, error, context?)
```

## Usage Examples

### Basic Error Logging
```typescript
import { logError, logInfo, logPerformance } from '../utils/log';

try {
  // Your operation
  await someAsyncOperation();
  logInfo('operation', 'Operation completed successfully');
} catch (error) {
  logError('operation', 'Operation failed', error, { 
    userId: user.id,
    additionalContext: 'some context' 
  });
}
```

### Performance Tracking
```typescript
import { logPerformance } from '../utils/log';

const startTime = Date.now();
try {
  await heavyOperation();
  logPerformance('heavyOperation', startTime, { 
    resultCount: results.length 
  });
} catch (error) {
  logPerformance('heavyOperation_error', startTime, { 
    error: true 
  });
}
```

### User Action Logging
```typescript
import { logUserAction } from '../utils/log';

logUserAction('button_clicked', { 
  buttonId: 'submit_form',
  screen: 'registration',
  userId: user.id 
});
```

### Error Reporting with User Feedback
```typescript
import { reportErrorWithFeedback } from '../utils/errorReporting';

try {
  await criticalOperation();
} catch (error) {
  await reportErrorWithFeedback(
    error,
    'criticalOperation',
    { userId: user.id, step: 'processing' },
    { allowContact: true, customMessage: 'Something went wrong while processing your data.' },
    user.id,
    user.email
  );
}
```

## Firebase Setup

### Required Collections
Create these collections in your Firebase Firestore:

1. **error_logs**
   - Fields: timestamp, level, category, message, data, userId, sessionId, deviceInfo

2. **error_reports**
   - Fields: errorId, timestamp, errorMessage, errorStack, userId, userEmail, action, context, deviceInfo

3. **error_resolutions**
   - Fields: errorId, resolutionNote, resolvedAt, resolvedBy

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only write their own error logs
    match /error_logs/{logId} {
      allow create: if request.auth.uid == resource.data.userId;
      allow read: if request.auth.uid == resource.data.userId || request.auth.token.admin == true;
    }
    
    // Error reports are write-only for users, read-only for admins
    match /error_reports/{reportId} {
      allow create: if request.auth != null;
      allow read: if request.auth.token.admin == true;
    }
    
    // Error resolutions are admin-only
    match /error_resolutions/{resolutionId} {
      allow create, read, update: if request.auth.token.admin == true;
    }
  }
}
```

## Debugging Workflow

### 1. When a User Reports an Issue

1. **Get User ID/Email**
   ```typescript
   const userId = 'user-uid-here';
   const userEmail = 'user@example.com';
   ```

2. **Retrieve Recent Errors**
   ```typescript
   import { getUserErrors, getErrorReports } from '../services/errorLogging';
   
   const userErrors = await getUserErrors(userId, 20);
   const allReports = await getErrorReports(50);
   ```

3. **Analyze Error Patterns**
   ```typescript
   const errorStats = await getErrorStats(userId);
   console.log('Error by level:', errorStats.errorByLevel);
   console.log('Error by category:', errorStats.errorByCategory);
   ```

### 2. Common Debugging Scenarios

#### Registration Issues
```typescript
// Look for registration errors
const regErrors = userErrors.filter(err => 
  err.category === 'registerUser' && 
  err.level === 'ERROR'
);

// Check for specific error patterns
const emailErrors = regErrors.filter(err => 
  err.data?.email === userEmail
);
```

#### Performance Issues
```typescript
// Look for slow operations
const perfIssues = userErrors.filter(err => 
  err.category === 'PERFORMANCE' && 
  err.data?.duration > 5000
);
```

#### Network Issues
```typescript
// Look for network errors
const networkErrors = userErrors.filter(err => 
  err.category === 'network' || 
  err.message.includes('network')
);
```

### 3. Error Resolution

1. **Identify Root Cause**
   - Review error messages and stack traces
   - Check context data for clues
   - Look for patterns in multiple errors

2. **Mark as Resolved**
   ```typescript
   import { errorLoggingService } from '../services/errorLogging';
   
   await errorLoggingService.markErrorAsResolved(
     errorId,
     'Fixed validation issue in registration form'
   );
   ```

3. **Monitor for Recurrence**
   - Set up alerts for similar errors
   - Track error trends over time

## Best Practices

### 1. Logging Guidelines
- **Be specific** with categories and messages
- **Include context** data that helps debugging
- **Don't log sensitive information** (passwords, tokens)
- **Use appropriate log levels** for severity

### 2. Error Handling
- **Always log errors** with proper context
- **Use structured logging** instead of console.log
- **Include user ID** when available
- **Add performance tracking** for critical operations

### 3. User Experience
- **Don't overwhelm users** with error dialogs
- **Provide helpful error messages** when possible
- **Offer options** for error reporting
- **Follow up** on critical issues

## Monitoring and Alerts

### Setting Up Monitoring
1. **Firebase Console**: Set up alerts for high error rates
2. **Custom Dashboard**: Create error tracking dashboard
3. **Email Notifications**: Set up alerts for critical errors

### Key Metrics to Track
- Error rate by category
- Performance degradation
- User-affected errors
- Resolution time

## Troubleshooting

### Common Issues

1. **Logs not appearing in Firebase**
   - Check Firebase configuration
   - Verify security rules
   - Check network connectivity

2. **Missing context data**
   - Ensure proper data structure in log calls
   - Check for undefined/null values

3. **Performance issues with logging**
   - Limit log frequency
   - Use batching for high-volume logging
   - Consider offline caching

### Debug Tools
- Firebase Console for viewing logs
- Browser dev tools for development
- React Native debugger for mobile testing

## Integration with Existing Code

The logging system is designed to integrate seamlessly with existing code. Replace existing `console.log` and basic error handling with the new structured logging system.

### Migration Steps
1. Replace `printLog` calls with appropriate `log*` functions
2. Add performance tracking to critical operations
3. Implement error reporting in user-facing error handlers
4. Set up Firebase collections and security rules

## Support

For questions or issues with the error logging system:
1. Check this guide first
2. Review the code documentation
3. Test in development environment
4. Monitor Firebase Console for issues
