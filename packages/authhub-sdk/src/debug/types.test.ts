/**
 * Tests for Breadcrumb Types
 * @task TASK-560
 * @feature FTR-123
 */

import { describe, it, expect } from 'vitest';
import type {
  Breadcrumb,
  BreadcrumbConfig,
  BreadcrumbLevel,
  BreadcrumbType,
  ElementDescriptor,
} from './types.js';

describe('Breadcrumb Types', () => {
  it('should allow valid BreadcrumbType values', () => {
    const types: BreadcrumbType[] = [
      'click',
      'navigation',
      'xhr',
      'fetch',
      'console',
      'dom',
      'custom',
    ];
    expect(types).toHaveLength(7);
  });

  it('should allow valid BreadcrumbLevel values', () => {
    const levels: BreadcrumbLevel[] = ['debug', 'info', 'warning', 'error'];
    expect(levels).toHaveLength(4);
  });

  it('should construct valid Breadcrumb objects', () => {
    const bc: Breadcrumb = {
      type: 'click',
      category: 'ui',
      message: 'Button clicked',
      timestamp: new Date().toISOString(),
      data: { elementId: 'submit-btn' },
      level: 'info',
    };
    expect(bc.type).toBe('click');
    expect(bc.category).toBe('ui');
  });

  it('should allow optional fields in Breadcrumb', () => {
    const bc: Breadcrumb = {
      type: 'custom',
      category: 'test',
      message: 'Test message',
      timestamp: new Date().toISOString(),
    };
    expect(bc.data).toBeUndefined();
    expect(bc.level).toBeUndefined();
  });

  it('should construct valid BreadcrumbConfig', () => {
    const config: BreadcrumbConfig = {
      maxBreadcrumbs: 100,
      enabledTypes: ['click', 'navigation'],
      beforeBreadcrumb: (b) => b,
    };
    expect(config.maxBreadcrumbs).toBe(100);
  });

  it('should allow optional fields in BreadcrumbConfig', () => {
    const config: BreadcrumbConfig = {};
    expect(config.maxBreadcrumbs).toBeUndefined();
    expect(config.enabledTypes).toBeUndefined();
    expect(config.beforeBreadcrumb).toBeUndefined();
  });

  it('should construct valid ElementDescriptor', () => {
    const desc: ElementDescriptor = {
      tag: 'button',
      id: 'submit-btn',
      classes: ['primary', 'large'],
      role: 'button',
      'aria-label': 'Submit form',
      'data-testid': 'submit-button',
    };
    expect(desc.tag).toBe('button');
    expect(desc.id).toBe('submit-btn');
    expect(desc.classes).toEqual(['primary', 'large']);
    expect(desc.role).toBe('button');
    expect(desc['aria-label']).toBe('Submit form');
    expect(desc['data-testid']).toBe('submit-button');
  });

  it('should allow minimal ElementDescriptor with only tag', () => {
    const desc: ElementDescriptor = {
      tag: 'div',
    };
    expect(desc.tag).toBe('div');
    expect(desc.id).toBeUndefined();
    expect(desc.classes).toBeUndefined();
  });

  it('should support beforeBreadcrumb returning null to filter', () => {
    const config: BreadcrumbConfig = {
      beforeBreadcrumb: (b) => {
        // Filter out debug breadcrumbs
        if (b.level === 'debug') {
          return null;
        }
        return b;
      },
    };

    const debugBreadcrumb: Breadcrumb = {
      type: 'custom',
      category: 'test',
      message: 'Debug message',
      timestamp: new Date().toISOString(),
      level: 'debug',
    };

    const infoBreadcrumb: Breadcrumb = {
      type: 'custom',
      category: 'test',
      message: 'Info message',
      timestamp: new Date().toISOString(),
      level: 'info',
    };

    expect(config.beforeBreadcrumb!(debugBreadcrumb)).toBeNull();
    expect(config.beforeBreadcrumb!(infoBreadcrumb)).toEqual(infoBreadcrumb);
  });
});
