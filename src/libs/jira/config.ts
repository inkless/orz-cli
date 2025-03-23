import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { confirm } from '@inquirer/prompts';

import { getDataDir } from '../paths.js';
import { getApiKey } from '../secrets.js';
import logger from '../logger.js';

/**
 * Interface for Jira config stored in JSON
 */
export interface JiraConfig {
  username: string;
  url: string;
  defaultProjectKey: string;
  supportedIssueTypes: string[];
  parentEpicChoices: { name: string; value: string }[];
  parentStoryChoices: { name: string; value: string }[];
  accountId: string;
  autoAssign: boolean;
  mainBranch: string;
}

export const DEFAULT_JIRA_CONFIG: JiraConfig = {
  username: '',
  url: '',
  defaultProjectKey: '',
  supportedIssueTypes: ['Story', 'Task', 'Sub-task'],
  parentEpicChoices: [
    { name: 'My Epic', value: 'PROJ-2' },
    { name: 'My Epic 2', value: 'PROJ-3' },
  ],
  parentStoryChoices: [],
  accountId: '',
  autoAssign: true,
  mainBranch: 'main',
};

const jiraConfigPath = join(getDataDir(), 'jira_config.json');

/**
 * Updates the Jira configuration JSON file
 * @param config Config object to save
 * @returns Whether the operation was successful
 */
export function saveJiraConfig(config: JiraConfig) {
  writeFileSync(jiraConfigPath, JSON.stringify(config, null, 2));
}

/**
 * Checks if the Jira config file exists
 * @returns Whether the config file exists
 */
export function checkConfigExists(): boolean {
  return existsSync(jiraConfigPath);
}

/**
 * Reads the Jira configuration from JSON
 * @returns The Jira config object, or an empty object if not found
 */
export function getJiraConfig(): JiraConfig {
  if (!checkConfigExists()) {
    logger.error('❌ Jira config not found.');
    logger.error('⚠️ Please run `orz-cli setup` to create a config.');
    process.exit(1);
  }
  const config = JSON.parse(readFileSync(jiraConfigPath, 'utf8'));
  return config as JiraConfig;
}

/**
 * Merges new fields from the default config into an existing config
 * @param existingConfig The existing Jira configuration
 * @returns Merged configuration with any new fields from the default config
 */
export function mergeJiraConfig(
  existingConfig: Partial<JiraConfig>,
): JiraConfig {
  // Create a new object with all default values, then override with existing values
  return { ...DEFAULT_JIRA_CONFIG, ...existingConfig } as JiraConfig;
}

/**
 * Checks if a config object has all required fields
 */
export function isConfigComplete(config: JiraConfig): boolean {
  return Object.keys(DEFAULT_JIRA_CONFIG).every(
    (key) => key in config && config[key as keyof JiraConfig] !== undefined,
  );
}

/**
 * Gets Jira API token from secrets
 * @returns The API token as a string, or null if not found
 */
export function getJiraApiToken(): string | null {
  return getApiKey('jira_api_token');
}

/**
 * Confirms if the user wants to update the Jira config or exit
 * @returns Whether the user wants to update the config
 */
export async function confirmUpdateConfigOrExit(): Promise<void> {
  const updateValues = await confirm({
    message: `Jira configuration already exists. Update it?`,
    default: false,
  });

  if (!updateValues) {
    logger.log(`ℹ️ Using existing Jira configuration.`);
    logger.log(`You can always update it manually in ${jiraConfigPath}`);
    process.exit(0);
  }
}

/**
 * Migrates the Jira config if it is incomplete
 * @returns The migrated Jira config
 */
export function migrateJiraConfigIfIncomplete(): JiraConfig {
  const existingConfig = getJiraConfig();
  if (!isConfigComplete(existingConfig)) {
    logger.log(
      `⚠️ Existing Jira configuration is incomplete. Migrating automatically...`,
    );
    const config = mergeJiraConfig(existingConfig);
    saveJiraConfig(config);
    return config;
  }
  return existingConfig;
}
