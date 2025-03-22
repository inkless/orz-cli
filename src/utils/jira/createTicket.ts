// Internal imports
import { input } from '@inquirer/prompts';
import { JiraClient, JiraIssueType } from './client.js';
import { getJiraConfig } from './setup.js';
import {
  SUPPORTED_ISSUE_TYPES,
  PARENT_EPIC_CHOICES,
  PARENT_STORY_CHOICES,
} from './constants.js';

/**
 * Parameters for creating a Jira ticket
 */
export interface CreateJiraTicketParams {
  summary: string;
  description?: string;
  projectKey?: string;
  issueType?: string;
  labels?: string[];
}

/**
 * Creates a Jira ticket and returns the ticket info
 */
export async function createJiraTicket(params: CreateJiraTicketParams) {
  const {
    summary,
    description = '',
    projectKey: initialProjectKey,
    issueType: jiraType,
  } = params;
  try {
    // Create Jira client from secrets
    const jiraClient = JiraClient.getInstance();

    // Get or prompt for Jira project key
    let projectKey = initialProjectKey;
    if (!projectKey) {
      projectKey = await input({
        message: 'Enter Jira project key (press enter to skip):',
        validate: (value) => (value ? true : 'Project key is required'),
      });
    }

    // Get available issue types
    console.log('📊 Fetching issue types for project...');
    const issueTypes = await jiraClient.getIssueTypes(projectKey);

    if (issueTypes.length === 0) {
      console.error(
        `❌ No issue types found for project ${projectKey}. Check project key.`,
      );
      process.exit(1);
    }

    let issueType: JiraIssueType;
    // Prompt user to select an issue type
    if (!jiraType) {
      // Map issue types to choices for selection
      const issueTypeChoices = issueTypes
        .filter((type) =>
          SUPPORTED_ISSUE_TYPES.includes(
            type.name as (typeof SUPPORTED_ISSUE_TYPES)[number],
          ),
        )
        .map((type) => ({
          name: type.name,
          value: type,
        }));

      // Use select prompt to let user choose an issue type
      const { select } = await import('@inquirer/prompts');
      const selectedIssueType = await select({
        message: 'Select issue type:',
        choices: issueTypeChoices,
      });

      issueType = selectedIssueType;
    } else {
      // find issueTypeId from issueTypes
      const foundIssueType = issueTypes.find(
        (type) => type.name?.toLowerCase() === jiraType.toLowerCase(),
      );

      if (!foundIssueType) {
        console.error(`❌ Issue type ${jiraType} not found.`);
        process.exit(1);
      }

      issueType = foundIssueType;
    }

    // Use select prompt to let user choose parent key
    let selectedParentKey: string;
    if (issueType.name === 'Sub-task') {
      const { select } = await import('@inquirer/prompts');
      selectedParentKey = await select({
        message: 'Select parent story:',
        choices: PARENT_STORY_CHOICES,
      });
    } else {
      const { select } = await import('@inquirer/prompts');
      selectedParentKey = await select({
        message: 'Select parent epic:',
        choices: PARENT_EPIC_CHOICES,
      });
    }

    // Create Jira ticket with PR title as summary
    console.log('🔄 Creating Jira ticket...');
    const issue = await jiraClient.createIssue({
      projectKey,
      summary,
      description,
      issueType: issueType.id,
      parentKey: selectedParentKey,
      labels: params.labels,
    });

    if (issue) {
      const jiraConfig = getJiraConfig();
      console.log(`✅ Jira ticket created successfully! Key: ${issue.key}`);
      const jiraUrl = `${jiraConfig.url}/browse/${issue.key}`;
      console.log(`🔗 URL: ${jiraUrl}`);

      return {
        key: issue.key,
        url: jiraUrl,
      };
    }

    return null;
  } catch (error: unknown) {
    console.error('Error creating Jira ticket:', error);
    throw error;
  }
}
