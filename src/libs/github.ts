import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { confirm } from '@inquirer/prompts';
import { projectRoot } from './paths.js';
import logger from './logger.js';

/**
 * Prompts user to confirm PR creation
 * @returns boolean indicating if user wants to continue
 */
export const confirmPrCreation = async (): Promise<boolean> => {
  const shouldContinue = await confirm({
    message: 'Continue with creating PR?',
    default: true,
  });

  if (!shouldContinue) {
    logger.log('❌ PR creation cancelled');
    process.exit(0);
  }

  return shouldContinue;
};

/**
 * Confirms if user wants to use the provided title
 * @param title PR title
 * @returns boolean indicating if user wants to use the title
 */
export const confirmPrTitle = async (title: string): Promise<boolean> => {
  return await confirm({
    message: `Do you want to use "${title}" as the PR title?`,
    default: true,
  });
};

/**
 * Creates a pull request using GitHub CLI
 * @param title PR title
 */
export const createPullRequest = (title: string): void => {
  let prCommand = 'gh pr create';

  if (title) {
    prCommand += ` --title "${title}"`;
  }

  // Add template if it exists
  const templatePath = join(projectRoot, '.github', 'pull_request_template.md');
  if (existsSync(templatePath)) {
    prCommand += ' --template "pull_request_template.md"';
  }

  logger.log('🔗 Creating GitHub pull request...');
  execSync(prCommand, { stdio: 'inherit' });
};
