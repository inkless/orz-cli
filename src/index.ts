#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import commands
import helloCommand from './commands/hello.js';
import setupCommand from './commands/setup.js';
import ghPullRequestCommand from './commands/gh-pull-request.js';
import createJiraTicketCommand from './commands/create-jira-ticket.js';
import logger from './libs/logger.js';

// Get package.json info
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// Create the main program
const program = new Command()
  .name('orz-cli')
  .description('ORZ CLI tooling')
  .version(packageJson.version)
  .addCommand(helloCommand)
  .addCommand(setupCommand)
  .addCommand(ghPullRequestCommand)
  .addCommand(createJiraTicketCommand);

// Add a default action for when no command is specified
program.action(() => {
  logger.log('Welcome to orz-cli CLI!');
  logger.log('Run `orz-cli --help` to see available commands.');
  program.help();
});

// Parse arguments and execute
program.parse(process.argv);
