// External packages
import { Command } from 'commander';
import { input } from '@inquirer/prompts';

// Internal imports
import { createJiraTicket } from '../utils/jira/createTicket.js';

const createJiraTicketCommand = new Command('create-jira-ticket')
  .description('Create a Jira ticket with the specified details')
  .option('-p, --project <project>', 'Jira project key', 'MOBILEPLAT')
  .option('-s, --summary <summary>', 'Issue summary')
  .option('-d, --description <description>', 'Issue description')
  .option('-t, --type <type>', 'Issue type (e.g., Bug, Task, Story)')
  .option('-l, --labels <labels>', 'Comma-separated list of labels')
  .action(async (options) => {
    let summary = options.summary;
    if (!summary) {
      summary = await input({
        message: 'Enter issue summary:',
        validate: (value) => (value ? true : 'Summary is required'),
      });
    }

    let description = options.description;
    if (!description) {
      description = await input({
        message: 'Enter issue description:',
        default: summary,
      });
    }

    let labels: string[] | undefined;
    if (options.labels) {
      labels = options.labels.split(',').map((label: string) => label.trim());
    }

    createJiraTicket({
      summary,
      description,
      projectKey: options.project,
      issueType: options.type,
      labels,
    });
  });

export default createJiraTicketCommand;
