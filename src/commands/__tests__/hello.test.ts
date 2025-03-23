import { expect, test, vi, describe, afterEach } from 'vitest';
import helloCommand from '../../commands/hello.js';
import logger from '../../libs/logger.js';

const mockedLog = vi.mocked(logger.log);

describe('Hello Command', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should say hello to the default name "World"', async () => {
    // Simulate command execution
    await helloCommand.parseAsync([], { from: 'user' });

    expect(mockedLog).toHaveBeenCalledWith('Hello, World!');
  });

  test('should say hello to a custom name', async () => {
    // Simulate command execution with a custom name
    await helloCommand.parseAsync(['Alice'], { from: 'user' });

    expect(mockedLog).toHaveBeenCalledWith('Hello, Alice!');
  });

  test('should say hello in uppercase when the uppercase option is provided', async () => {
    // Simulate command execution with the uppercase option
    await helloCommand.parseAsync(['Bob', '--uppercase'], {
      from: 'user',
    });

    expect(mockedLog).toHaveBeenCalledWith('HELLO, BOB!');
  });

  test('should say hello in uppercase with the shorthand option', async () => {
    // Simulate command execution with the shorthand uppercase option
    await helloCommand.parseAsync(['Charlie', '-u'], { from: 'user' });

    expect(mockedLog).toHaveBeenCalledWith('HELLO, CHARLIE!');
  });
});
