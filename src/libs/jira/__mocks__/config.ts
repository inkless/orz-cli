import { vi } from 'vitest';

export const DEFAULT_JIRA_CONFIG = {
  username: 'testuser',
  url: 'https://jira.example.com',
  defaultProjectKey: 'TEST',
  supportedIssueTypes: ['Story', 'Task', 'Bug'],
  parentEpicChoices: [{ name: 'Test Epic', value: 'TEST-1' }],
  parentStoryChoices: [{ name: 'Test Story', value: 'TEST-2' }],
  accountId: 'test-account-id',
  autoAssign: true,
  mainBranch: 'main',
};

export const getJiraConfig = vi.fn().mockReturnValue(DEFAULT_JIRA_CONFIG);
export const getJiraApiToken = vi.fn().mockReturnValue('test-api-token');
export const saveJiraConfig = vi.fn();
export const checkConfigExists = vi.fn().mockReturnValue(true);
export const isConfigComplete = vi.fn().mockReturnValue(true);
export const mergeJiraConfig = vi.fn();
export const confirmUpdateConfigOrExit = vi.fn();
export const migrateJiraConfigIfIncomplete = vi
  .fn()
  .mockReturnValue(DEFAULT_JIRA_CONFIG);
