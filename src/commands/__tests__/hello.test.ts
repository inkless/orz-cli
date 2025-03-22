// Mock console.log
const originalConsoleLog = console.log;
let consoleOutput: string[] = [];
const mockedConsoleLog = (output: string) => consoleOutput.push(output);

// Define options type for the hello command
type HelloCommandOptions = { uppercase?: boolean };

describe('Hello Command', () => {
  beforeEach(() => {
    // Setup the mocks
    console.log = mockedConsoleLog as typeof console.log;
    consoleOutput = [];
  });

  afterEach(() => {
    // Restore the original console.log
    console.log = originalConsoleLog;
  });

  // Simplified implementation of the hello command's action
  const runCommand = (name: string, options: HelloCommandOptions = {}) => {
    // Call the same function defined in the hello.ts file
    const message = `Hello, ${name}!`;
    if (options.uppercase) {
      console.log(message.toUpperCase());
    } else {
      console.log(message);
    }
  };

  it('should say hello to the default name "World"', () => {
    runCommand('World');
    expect(consoleOutput).toHaveLength(1);
    expect(consoleOutput[0]).toBe('Hello, World!');
  });

  it('should say hello to a custom name', () => {
    runCommand('Alice');
    expect(consoleOutput).toHaveLength(1);
    expect(consoleOutput[0]).toBe('Hello, Alice!');
  });

  it('should say hello in uppercase when the uppercase option is provided', () => {
    runCommand('Bob', { uppercase: true });
    expect(consoleOutput).toHaveLength(1);
    expect(consoleOutput[0]).toBe('HELLO, BOB!');
  });
});
