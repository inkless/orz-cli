import { Command } from 'commander';
import { getDataDir } from '../libs/paths.js';
import { setupJira } from '../libs/jira/setup.js';
import { checkGitHubCli } from '../libs/commands.js';
import logger from '../libs/logger.js';

const setupCommand = new Command('setup')
  .description('Setup the CLI tool and configure required settings')
  .option('-f, --force', 'Force setup even if configuration already exists')
  .action(async (options) => {
    try {
      logger.log('🚀 Setting up the CLI tool...');

      // Get platform-specific data directory
      getDataDir({ create: true });

      // Setup all Jira credentials and config
      await setupJira(options.force);

      // Check if GitHub CLI is installed
      checkGitHubCli();

      logger.log('🎉 Setup completed successfully!');
    } catch (error) {
      logger.error('Error during setup:', error);
      process.exit(1);
    }
  });

export default setupCommand;
