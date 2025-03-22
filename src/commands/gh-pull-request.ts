// Node.js core modules
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

// External packages
import { Command } from 'commander';
import { confirm } from '@inquirer/prompts';

// Internal imports
import { checkGitHubCli } from '../utils/commands.js';
import { projectRoot } from '../utils/paths.js';
import { createJiraTicket } from '../utils/jira/createTicket.js';
import { getJiraConfig } from '../utils/jira/setup.js';

const ghPullRequestCommand = new Command('gh-pull-request')
  .description('Create a GitHub pull request with current branch changes')
  .option('-j, --jira', 'Create a Jira ticket for this PR', true)
  .option('--jira-project <jiraProject>', 'Jira project key')
  .option('--jira-type <jiraType>', 'Jira issue type')
  .action(async (options) => {
    try {
      const jiraConfig = getJiraConfig();

      // Check if GitHub CLI is installed
      if (!checkGitHubCli()) {
        process.exit(1);
      }

      // Show git diff with main branch
      console.log('📊 Showing diff with main branch:');
      console.log('-------------------------------');
      execSync('git diff main --stat', { stdio: 'inherit' });
      console.log('-------------------------------');

      // Prompt user to confirm using Inquirer
      const shouldContinue = await confirm({
        message: 'Continue with creating PR?',
        default: true,
      });

      if (!shouldContinue) {
        console.log('❌ PR creation cancelled');
        process.exit(0);
      }

      // Get current branch name
      const currentBranch = execSync('git branch --show-current')
        .toString()
        .trim();

      // Push to remote
      // check if current branch is already pushed to remote
      const remoteRef = execSync(
        `git ls-remote --heads origin ${currentBranch}`,
      )
        .toString()
        .trim();

      if (!remoteRef) {
        console.log(`🚀 Pushing branch ${currentBranch} to remote...`);
        try {
          execSync(`git push -u origin ${currentBranch}`, { stdio: 'inherit' });
        } catch (error) {
          console.error('Error pushing to remote:', error);
          process.exit(1);
        }
      }

      // Read first commit message after main
      console.log('📝 Extracting commit message for PR title...');
      let commitMessage = execSync(
        `git log main..${currentBranch} --format=%s --reverse | head -1`,
      )
        .toString()
        .trim();

      // Create pull request using gh CLI
      let prCommand = 'gh pr create';

      let jiraUrl = '';

      // Create Jira ticket if requested
      if (options.jira) {
        // confirm if user want to create a Jira ticket
        const shouldCreateJira = await confirm({
          message: 'Create a Jira ticket for this PR?',
          default: true,
        });

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
      }

      // Confirm if user wants to use this title
      const useTitle = await confirm({
        message: `Do you want to use "${commitMessage}" as the PR title?`,
        default: true,
      });

      if (useTitle) {
        prCommand += ` --title "${commitMessage}"`;
      }

      // Add template if it exists
      const templatePath = join(
        projectRoot,
        '.github',
        'pull_request_template.md',
      );
      if (existsSync(templatePath)) {
        prCommand += ' --template "pull_request_template.md"';
      }

      console.log('🔗 Creating GitHub pull request...');
      execSync(prCommand, { stdio: 'inherit' });

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
