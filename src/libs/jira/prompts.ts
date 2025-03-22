import { confirm } from '@inquirer/prompts';

export const confirmJiraTicketCreation = async (): Promise<boolean> => {
  const shouldCreateJira = await confirm({
    message: 'Create a Jira ticket for this PR?',
    default: true,
  });

  return shouldCreateJira;
};
