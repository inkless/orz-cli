// Node.js core modules

// External packages
import { Command } from 'commander';

// Internal imports
import { checkGitHubCli } from '../libs/commands.js';
import { createJiraTicket } from '../libs/jira/createTicket.js';
import { getJiraConfig } from '../libs/jira/config.js';
import {
  showDiffWithMainBranch,
  getCurrentBranch,
  pushBranchToRemote,
  getFirstCommitMessage,
  getMainBranch,
} from '../libs/git.js';
import {
  confirmPrCreation,
  confirmPrTitle,
  createPullRequest,
} from '../libs/github.js';
import { confirmJiraTicketCreation } from '../libs/jira/prompts.js';

const ghPullRequestCommand = new Command('gh-pull-request')
  .description('Create a GitHub pull request with current branch changes')
  .option('-j, --jira', 'Create a Jira ticket for this PR')
  .option('--jira-project <jiraProject>', 'Jira project key')
  .option('--jira-type <jiraType>', 'Jira issue type')
  .action(async (options) => {
    try {
      // Check if GitHub CLI is installed
      if (!checkGitHubCli()) {
        process.exit(1);
      }

      // Get current branch name
      const currentBranch = getCurrentBranch();

      // Get main branch name
      const mainBranch = getMainBranch();

      // Check if current branch is main branch
      if (currentBranch === mainBranch) {
        console.error(`⚠️ Error: You are working on the ${mainBranch} branch.`);
        console.error(
          'Please checkout a new branch before creating a pull request.',
        );
        process.exit(1);
      }

      const jiraConfig = getJiraConfig();

      // Show git diff with main branch
      showDiffWithMainBranch();

      // Prompt user to confirm
      await confirmPrCreation();

      // Push to remote if needed
      pushBranchToRemote(currentBranch);

      // Get commit message for PR title
      let commitMessage = getFirstCommitMessage(currentBranch);

      // Create pull request using gh CLI
      let jiraUrl = '';

      // confirm if user want to create a Jira ticket
      const shouldCreateJira =
        options.jira || (await confirmJiraTicketCreation());

      // Create Jira ticket if requested
      if (shouldCreateJira) {
        const jiraTicket = await createJiraTicket({
          summary: commitMessage,
          projectKey: options.jiraProject || jiraConfig.defaultProjectKey,
          issueType: options.jiraType,
        });

        if (jiraTicket) {
          commitMessage = `${commitMessage} [${jiraTicket.key}]`;
          jiraUrl = jiraTicket.url;
        }
      }

      // Confirm if user wants to use this title
      const useTitle = await confirmPrTitle(commitMessage);

      if (useTitle) {
        createPullRequest(commitMessage);
      } else {
        createPullRequest('');
      }

      console.log('✅ Pull request created successfully!');
      if (jiraUrl) {
        console.log(`🔗 Jira URL: ${jiraUrl}`);
      }
    } catch (error) {
      console.error('Error creating pull request:', error);
      process.exit(1);
    }
  });

export default ghPullRequestCommand;
