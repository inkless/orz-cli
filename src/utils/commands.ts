import { execSync } from 'child_process';

/**
 * Checks if a command exists in the system PATH
 * @param command The command to check
 * @returns True if the command exists, false otherwise
 */
export function commandExists(command: string): boolean {
  try {
    // Use 'which' on Unix/macOS and 'where' on Windows
    const checkCommand =
      process.platform === 'win32' ? `where ${command}` : `which ${command}`;

    execSync(checkCommand, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if GitHub CLI (gh) is installed and warns the user if it's not
 * @returns True if gh is installed, false otherwise
 */
export function checkGitHubCli(): boolean {
  const isInstalled = commandExists('gh');

  if (!isInstalled) {
    console.warn('⚠️ GitHub CLI (gh) is not installed or not in your PATH.');
    console.warn(
      'Please install it from https://cli.github.com/ to use GitHub-related features.',
    );
  }

  return isInstalled;
}
