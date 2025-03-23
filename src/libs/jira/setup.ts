import { input } from '@inquirer/prompts';
import { setupApiKey } from '../secrets.js';
import { JiraClient } from './client.js';
import {
  DEFAULT_JIRA_CONFIG,
  getJiraConfig,
  saveJiraConfig,
  checkConfigExists,
  confirmUpdateConfigOrExit,
  migrateJiraConfigIfIncomplete,
} from './config.js';
import logger from '../logger.js';

/**
 * Sets up all necessary Jira credentials in one function
 * @param force Whether to force update existing keys
 * @returns Promise resolving to true if all keys were set successfully
 */
export async function setupJira(force: boolean): Promise<void> {
  logger.log('📋 Setting up Jira...');

  let config = DEFAULT_JIRA_CONFIG;

  // Check if config exists
  if (checkConfigExists() && !force) {
    config = migrateJiraConfigIfIncomplete();

    await confirmUpdateConfigOrExit();
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

    logger.log(`✅ Jira configuration stored successfully!`);
  } else {
    logger.log(`⚠️ Jira configuration incomplete. Setup aborted.`);
    return;
  }
}
