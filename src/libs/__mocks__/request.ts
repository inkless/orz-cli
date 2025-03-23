import { vi } from 'vitest';

export interface RequestConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: object;
  headers?: Record<string, string>;
}

// Mock implementation that simulates various responses based on the endpoint
export const request = vi
  .fn()
  .mockImplementation(async (options: RequestOptions) => {
    const { url } = options;

    // Mock responses for different endpoints
    if (url.includes('/rest/api/3/issue')) {
      return {
        id: '123',
        key: 'TEST-123',
        self: `${url}`,
      };
    }

    if (url.includes('/rest/api/3/project/')) {
      const projectKey = url.split('/').pop();
      return {
        id: '10000',
        key: projectKey,
        name: `Test Project ${projectKey}`,
        issueTypes: [
          { id: '10001', name: 'Story' },
          { id: '10002', name: 'Task' },
          { id: '10003', name: 'Bug' },
        ],
      };
    }

    if (url.includes('/rest/api/3/myself')) {
      return {
        accountId: 'test-account-id',
        emailAddress: 'test@example.com',
        displayName: 'Test User',
        active: true,
        timeZone: 'UTC',
        locale: 'en_US',
        self: `${url.split('/rest/api/3/myself')[0]}/rest/api/3/user?accountId=test-account-id`,
      };
    }

    // Default fallback for unhandled endpoints
    return null;
  });
