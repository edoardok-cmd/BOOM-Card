/**
 * Browser Extension Conflict Handler
 * Handles conflicts with common browser extensions that may interfere with the app
 */

export class ExtensionHandler {
  private static instance: ExtensionHandler;
  private extensionErrors: Set<string> = new Set();
  private consoleErrorHandler: ((event: ErrorEvent) => void) | null = null;

  private constructor() {
    this.initializeErrorHandlers();
  }

  static getInstance(): ExtensionHandler {
    if (!ExtensionHandler.instance) {
      ExtensionHandler.instance = new ExtensionHandler();
    }
    return ExtensionHandler.instance;
  }

  private initializeErrorHandlers() {
    if (typeof window === 'undefined') return;

    // Override console.error to filter out extension errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorString = args.join(' ');
      
      // Filter out known extension errors
      const extensionPatterns = [
        /MetaMask/i,
        /LaunchDarkly/i,
        /chrome-extension:/i,
        /moz-extension:/i,
        /Unchecked runtime\.lastError/i,
        /The message port closed before a response was received/i,
        /Failed to load resource.*clientstream\.launchdarkly\.com/i,
      ];

      const isExtensionError = extensionPatterns.some(pattern => 
        pattern.test(errorString)
      );

      if (isExtensionError) {
        this.extensionErrors.add(errorString);
        // Log to a separate debug channel if needed
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Extension Error Filtered]:', errorString);
        }
        return;
      }

      // Pass through non-extension errors
      originalConsoleError.apply(console, args);
    };

    // Handle global error events
    this.consoleErrorHandler = (event: ErrorEvent) => {
      const isExtensionError = 
        event.filename?.includes('chrome-extension://') ||
        event.filename?.includes('moz-extension://') ||
        event.message?.includes('MetaMask') ||
        event.message?.includes('LaunchDarkly');

      if (isExtensionError) {
        event.preventDefault();
        this.extensionErrors.add(event.message);
      }
    };

    window.addEventListener('error', this.consoleErrorHandler);
  }

  /**
   * Get filtered errors (excluding extension errors)
   */
  getFilteredErrors(): string[] {
    return Array.from(this.extensionErrors);
  }

  /**
   * Check if specific extensions are causing issues
   */
  detectProblematicExtensions(): {
    metaMask: boolean;
    launchDarkly: boolean;
    otherExtensions: boolean;
  } {
    const errors = Array.from(this.extensionErrors);
    return {
      metaMask: errors.some(e => /MetaMask/i.test(e)),
      launchDarkly: errors.some(e => /LaunchDarkly/i.test(e)),
      otherExtensions: errors.some(e => 
        /chrome-extension:|moz-extension:/i.test(e) && 
        !/MetaMask|LaunchDarkly/i.test(e)
      ),
    };
  }

  /**
   * Display user-friendly notification about extension conflicts
   */
  notifyUserAboutExtensions() {
    const problematic = this.detectProblematicExtensions();
    const hasIssues = Object.values(problematic).some(v => v);

    if (!hasIssues) return;

    // Only show notification once per session
    const notificationKey = 'extension-conflict-notified';
    if (sessionStorage.getItem(notificationKey)) return;

    sessionStorage.setItem(notificationKey, 'true');

    // You can integrate this with your notification system
    console.info(
      '%c⚠️ Browser Extension Notice',
      'color: orange; font-weight: bold; font-size: 14px;',
      '\nSome browser extensions may interfere with this application.',
      '\nIf you experience issues, try:',
      '\n1. Disabling extensions temporarily',
      '\n2. Using incognito/private mode',
      '\n3. Adding this site to extension whitelists'
    );
  }

  /**
   * Clean up handlers
   */
  destroy() {
    if (this.consoleErrorHandler && typeof window !== 'undefined') {
      window.removeEventListener('error', this.consoleErrorHandler);
    }
  }
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  ExtensionHandler.getInstance();
}

export default ExtensionHandler;