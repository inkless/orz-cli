import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { confirm, input } from '@inquirer/prompts';
import { setupApiKey, getApiKey } from '../secrets.js';
import { getDataDir } from '../paths.js';

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
}

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
 * Sets up all necessary Jira credentials in one function
 * @param force Whether to force update existing keys
 * @returns Promise resolving to true if all keys were set successfully
 */
export async function setupJira(force: boolean): Promise<void> {
  console.log('📋 Setting up Jira...');

  let config: JiraConfig = {
    username: '',
    url: '',
    defaultProjectKey: '',
    supportedIssueTypes: ['Story', 'Task', 'Sub-task'],
    parentEpicChoices: [
      { name: 'My Epic', value: 'PROJ-2' },
      { name: 'My Epic 2', value: 'PROJ-3' },
    ],
    parentStoryChoices: [],
  };
  let shouldPrompt = true;

  // Check if config exists
  if (existsSync(jiraConfigPath) && !force) {
    config = JSON.parse(readFileSync(jiraConfigPath, 'utf8'));

    if (config.username && config.url) {
      const updateValues = await confirm({
        message: `Jira configuration already exists. Update it?`,
        default: false,
      });

      if (!updateValues) {
        console.log(`ℹ️ Using existing Jira configuration.`);
        shouldPrompt = false;
      }
    }
  }

  if (shouldPrompt) {
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

    if (username && url && defaultProjectKey) {
      // Save both values at once
      saveJiraConfig({
        ...config,
        username,
        url,
        defaultProjectKey,
      });
      console.log(`✅ Jira configuration stored successfully!`);
    } else {
      console.log(`⚠️ Jira configuration incomplete. Setup aborted.`);
      return;
    }
  }

  // Setup Jira API token (sensitive, stored as secret)
  await setupApiKey('jira_api_token', force, {
    promptMessage: 'Enter your Jira API token:',
    successMessage: '✅ Jira API token stored successfully (read-only)!',
    skipMessage: '⚠️ No Jira API token provided. Skipping token setup.',
  });
}

/**
 * Gets Jira API token from secrets
 * @returns The API token as a string, or null if not found
 */
export function getJiraApiToken(): string | null {
  return getApiKey('jira_api_token');
}
