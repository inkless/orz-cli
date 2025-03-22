import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { confirm, input } from '@inquirer/prompts';
import { setupApiKey, getApiKey } from '../secrets.js';
import { getDataDir } from '../paths.js';
import { JiraClient } from './client.js';

/**
 * Interface for Jira config stored in JSON
 */
interface JiraConfig {
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

const DEFAULT_JIRA_CONFIG: JiraConfig = {
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

const dataDir = getDataDir();
const jiraConfigPath = join(dataDir, 'jira_config.json');

/**
 * Updates the Jira configuration JSON file
 * @param config Config object to save
 * @returns Whether the operation was successful
 */
function saveJiraConfig(config: JiraConfig) {
  writeFileSync(jiraConfigPath, JSON.stringify(config, null, 2));
}

/**
 * Reads the Jira configuration from JSON
 * @returns The Jira config object, or an empty object if not found
 */
export function getJiraConfig(): JiraConfig {
  if (!existsSync(jiraConfigPath)) {
    throw new Error('Jira config not found');
  }
  const config = JSON.parse(readFileSync(jiraConfigPath, 'utf8'));
  return config as JiraConfig;
}

/**
 * Merges new fields from the default config into an existing config
 * @param existingConfig The existing Jira configuration
 * @returns Merged configuration with any new fields from the default config
 */
function mergeJiraConfig(existingConfig: Partial<JiraConfig>): JiraConfig {
  // Create a new object with all default values, then override with existing values
  return { ...DEFAULT_JIRA_CONFIG, ...existingConfig } as JiraConfig;
}

function isConfigComplete(config: JiraConfig): boolean {
  return Object.keys(DEFAULT_JIRA_CONFIG).every(
    (key) => key in config && config[key as keyof JiraConfig] !== undefined,
  );
}

/**
 * Sets up all necessary Jira credentials in one function
 * @param force Whether to force update existing keys
 * @returns Promise resolving to true if all keys were set successfully
 */
export async function setupJira(force: boolean): Promise<void> {
  console.log('📋 Setting up Jira...');

  let config = DEFAULT_JIRA_CONFIG;

  // Check if config exists
  if (existsSync(jiraConfigPath) && !force) {
    const existingConfig = JSON.parse(readFileSync(jiraConfigPath, 'utf8'));

    if (!isConfigComplete(existingConfig)) {
      console.log(
        `⚠️ Existing Jira configuration is incomplete. Migrating automatically...`,
      );
      config = mergeJiraConfig(existingConfig);
      saveJiraConfig(mergeJiraConfig(config));
    }

    const updateValues = await confirm({
      message: `Jira configuration already exists. Update it?`,
      default: false,
    });

    if (!updateValues) {
      console.log(`ℹ️ Using existing Jira configuration.`);
      console.log(`You can always update it manually in ${jiraConfigPath}`);
      process.exit(0);
    }
  }

  // Collect credentials together
  const username = await input({
    message: 'Enter your Jira username (email):',
    required: true,
  });

  const url = await input({
    message: 'Enter your Jira URL (e.g., https://your-domain.atlassian.net):',
    required: true,
  });

  const defaultProjectKey = await input({
    message: 'Enter your Jira default project key:',
    required: true,
  });

  // Setup Jira API token (sensitive, stored as secret)
  await setupApiKey('jira_api_token', force, {
    promptMessage: 'Enter your Jira API token:',
    successMessage: '✅ Jira API token stored successfully (read-only)!',
    skipMessage: '⚠️ No Jira API token provided. Skipping token setup.',
  });

  if (username && url && defaultProjectKey) {
    // Save all values at once
    saveJiraConfig({
      ...config,
      username,
      url,
      defaultProjectKey,
    });

    // Get current user
    const jiraClient = JiraClient.getInstance();
    const currentUser = await jiraClient.getCurrentUser();
    if (currentUser) {
      saveJiraConfig({
        ...getJiraConfig(),
        accountId: currentUser.accountId,
      });
    }

    console.log(`✅ Jira configuration stored successfully!`);
  } else {
    console.log(`⚠️ Jira configuration incomplete. Setup aborted.`);
    return;
  }
}

/**
 * Gets Jira API token from secrets
 * @returns The API token as a string, or null if not found
 */
export function getJiraApiToken(): string | null {
  return getApiKey('jira_api_token');
}
