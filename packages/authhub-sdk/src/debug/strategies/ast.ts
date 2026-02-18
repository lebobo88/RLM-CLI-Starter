/**
 * AST Capture Strategy - Stack Parsing
 *
 * Parses error stack traces from Chrome/Edge and Firefox formats
 * to extract structured call stack frame information.
 *
 * @task TASK-579
 * @feature FTR-122
 */

import type {
  CaptureStrategy,
  CaptureContext,
  ASTCapture,
  CallStackFrame,
} from './types.js';

export class ASTStrategy implements CaptureStrategy<ASTCapture> {
  readonly name = 'ast';
  readonly maxSize = 10240;

  // Chrome/Edge: "    at functionName (file:line:col)" or "    at file:line:col"
  private static readonly CHROME_REGEX =
    /^\s*at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/;

  // Firefox: "functionName@file:line:col"
  private static readonly FIREFOX_REGEX =
    /^(.*)@(.+?):(\d+):(\d+)$/;

  async capture(context?: CaptureContext): Promise<ASTCapture> {
    const error = context?.error || new Error('Capture point');
    const stack = error.stack || '';
    const callStack = this.parseStack(stack);
    const errorLocation = this.getErrorLocation(callStack);

    return {
      errorLocation,
      contextNodes: [],
      callStack,
      capturedAt: new Date().toISOString(),
    };
  }

  private parseStack(stack: string): CallStackFrame[] {
    const frames: CallStackFrame[] = [];
    const lines = stack.split('\n');

    for (const line of lines) {
      if (frames.length >= 20) break;
      const frame = this.parseStackLine(line);
      if (frame) frames.push(frame);
    }

    return frames;
  }

  private parseStackLine(line: string): CallStackFrame | null {
    let match = line.match(ASTStrategy.CHROME_REGEX);
    if (match) {
      return {
        functionName: this.sanitizeFunctionName(match[1] || ''),
        fileName: this.sanitizeFileName(match[2] || ''),
        lineNumber: parseInt(match[3] || '0', 10),
        columnNumber: parseInt(match[4] || '0', 10),
      };
    }

    match = line.match(ASTStrategy.FIREFOX_REGEX);
    if (match) {
      return {
        functionName: this.sanitizeFunctionName(match[1] || ''),
        fileName: this.sanitizeFileName(match[2] || ''),
        lineNumber: parseInt(match[3] || '0', 10),
        columnNumber: parseInt(match[4] || '0', 10),
      };
    }

    return null;
  }

  private sanitizeFileName(fileName: string): string {
    let sanitized = fileName;

    // Extract pathname from URLs (http://, https://, file://)
    try {
      const url = new URL(sanitized);
      sanitized = url.pathname;
    } catch {
      // Not a URL, use as-is
    }

    // Remove query strings and hash fragments
    const queryIndex = sanitized.indexOf('?');
    if (queryIndex !== -1) {
      sanitized = sanitized.substring(0, queryIndex);
    }
    const hashIndex = sanitized.indexOf('#');
    if (hashIndex !== -1) {
      sanitized = sanitized.substring(0, hashIndex);
    }

    // Truncate to 200 characters
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200);
    }

    return sanitized;
  }

  private sanitizeFunctionName(name: string): string {
    // Keep only alphanumeric, underscore, dot, angle brackets, and square brackets
    let sanitized = name.replace(/[^a-zA-Z0-9_.<>\[\]]/g, '');

    // Return '<anonymous>' if empty after sanitization
    if (sanitized.length === 0) {
      return '<anonymous>';
    }

    // Truncate to 100 characters
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }

    return sanitized;
  }

  private getErrorLocation(
    callStack: CallStackFrame[],
  ): ASTCapture['errorLocation'] {
    const firstFrame = callStack[0];
    const loc: ASTCapture['errorLocation'] = {
      file: firstFrame?.fileName || 'unknown',
      line: firstFrame?.lineNumber || 0,
      column: firstFrame?.columnNumber || 0,
    };
    if (firstFrame?.functionName) loc.functionName = firstFrame.functionName;
    return loc;
  }
}
