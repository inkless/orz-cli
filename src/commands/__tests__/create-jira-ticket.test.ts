import { expect, vi, describe, test, afterEach } from 'vitest';
import { input, select } from '@inquirer/prompts';
import createJiraTicketCommand from '../../commands/create-jira-ticket.js';
import logger from '../../libs/logger.js';
import { request } from '../../libs/request.js';

// For internal modules, the mocks are in __mocks__ folders next to the original modules
vi.mock('../../libs/jira/config.js');

const mockedLog = vi.mocked(logger.log);

describe('Create Jira Ticket Command', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should create a Jira ticket with provided options', async () => {
    // Setup command arguments and options
    const args = [
      '--project',
      'PROJ',
      '--summary',
      'Test Issue Summary',
      '--description',
      'Test Issue Description',
      '--type',
      'Bug',
      '--labels',
      'frontend,bug',
    ];

    // Execute the command
    await createJiraTicketCommand.parseAsync(args, { from: 'user' });

    await vi.waitFor(() => {
      // Assert success messages were logged
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '✅ Jira ticket created successfully! Key: TEST-123',
        ),
      );
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '🔗 URL: https://jira.example.com/browse/TEST-123',
        ),
      );
    });
  });

  test('should use default project key when not provided', async () => {
    // Setup command arguments and options
    const args = [
      '--summary',
      'Test Issue Summary',
      '--description',
      'Test Issue Description',
      '--type',
      'Task',
    ];

    // Execute the command
    await createJiraTicketCommand.parseAsync(args, { from: 'user' });

    await vi.waitFor(() => {
      expect(vi.mocked(request)).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://jira.example.com/rest/api/3/project/TEST',
        }),
      );

      expect(vi.mocked(request)).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://jira.example.com/rest/api/3/issue',
          method: 'POST',
          body: expect.objectContaining({
            fields: expect.objectContaining({
              project: { key: 'TEST' },
              summary: 'Test Issue Summary',
              issuetype: { id: '10002' },
            }),
          }),
        }),
      );

      // Assert success messages were logged
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '✅ Jira ticket created successfully! Key: TEST-123',
        ),
      );
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '🔗 URL: https://jira.example.com/browse/TEST-123',
        ),
      );
    });
  });

  test('should prompt for summary when not provided', async () => {
    // Setup mock for input prompt
    vi.mocked(input).mockResolvedValueOnce('Prompted Summary');

    // Setup command arguments with missing summary
    const args = [
      '--project',
      'PROJ',
      '--description',
      'Test Issue Description',
      '--type',
      'Story',
    ];

    // Execute the command
    await createJiraTicketCommand.parseAsync(args, { from: 'user' });

    // Assert that input was called to prompt for summary
    expect(input).toHaveBeenCalledWith({
      message: 'Enter issue summary:',
      required: true,
    });

    // Assert the correct client methods were called
    await vi.waitFor(() => {
      // Assert success messages were logged
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '✅ Jira ticket created successfully! Key: TEST-123',
        ),
      );
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '🔗 URL: https://jira.example.com/browse/TEST-123',
        ),
      );
    });
  });

  test('should prompt for description when not provided', async () => {
    // Setup mock for input prompt
    vi.mocked(input).mockResolvedValueOnce('Prompted Description');

    // Setup command arguments with missing description
    const args = [
      '--project',
      'PROJ',
      '--summary',
      'Test Issue Summary',
      '--type',
      'Bug',
    ];

    // Execute the command
    await createJiraTicketCommand.parseAsync(args, { from: 'user' });

    // Assert that input was called to prompt for description
    expect(input).toHaveBeenCalledWith({
      message: 'Enter issue description:',
      default: 'Test Issue Summary',
    });

    // Assert the correct client methods were called
    await vi.waitFor(() => {
      // Assert success messages were logged
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '✅ Jira ticket created successfully! Key: TEST-123',
        ),
      );
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '🔗 URL: https://jira.example.com/browse/TEST-123',
        ),
      );
    });
  });

  test('should parse labels correctly', async () => {
    // Setup command arguments with labels
    const args = [
      '--project',
      'PROJ',
      '--summary',
      'Test Issue Summary',
      '--description',
      'Test Issue Description',
      '--type',
      'Task',
      '--labels',
      'frontend, backend, critical',
    ];

    // Execute the command
    await createJiraTicketCommand.parseAsync(args, { from: 'user' });

    // Assert the correct client methods were called
    await vi.waitFor(() => {
      // Assert success messages were logged
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '✅ Jira ticket created successfully! Key: TEST-123',
        ),
      );
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '🔗 URL: https://jira.example.com/browse/TEST-123',
        ),
      );
    });
  });

  test('should prompt for issue type when not provided', async () => {
    // Setup mocks for select prompt and issue types
    vi.mocked(select).mockResolvedValueOnce({ id: '10001', name: 'Story' });

    // Setup command arguments without issue type
    const args = [
      '--project',
      'PROJ',
      '--summary',
      'Test Issue Summary',
      '--description',
      'Test Issue Description',
    ];

    // Execute the command
    await createJiraTicketCommand.parseAsync(args, { from: 'user' });

    await vi.waitFor(() => {
      // Assert that select was called to choose an issue type
      expect(vi.mocked(select)).toHaveBeenCalledWith({
        message: 'Select issue type:',
        choices: expect.arrayContaining([
          expect.objectContaining({ name: 'Story' }),
          expect.objectContaining({ name: 'Task' }),
          expect.objectContaining({ name: 'Bug' }),
        ]),
      });

      // Assert success messages were logged
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '✅ Jira ticket created successfully! Key: TEST-123',
        ),
      );
      expect(mockedLog).toHaveBeenCalledWith(
        expect.stringContaining(
          '🔗 URL: https://jira.example.com/browse/TEST-123',
        ),
      );
    });
  });
});
