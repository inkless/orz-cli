import { execSync } from 'node:child_process';

/**
 * Shows git diff with main branch
 */
export const showDiffWithMainBranch = () => {
  console.log('📊 Showing diff with main branch:');
  console.log('-------------------------------');
  execSync('git diff main --stat', { stdio: 'inherit' });
  console.log('-------------------------------');
};

/**
 * Gets current branch name
 * @returns current branch name
 */
export const getCurrentBranch = (): string => {
  return execSync('git branch --show-current').toString().trim();
};

/**
 * Pushes current branch to remote if it doesn't exist
 * @param branchName current branch name
 */
export const pushBranchToRemote = (branchName: string): void => {
  const remoteRef = execSync(`git ls-remote --heads origin ${branchName}`)
    .toString()
    .trim();

  if (!remoteRef) {
    console.log(`🚀 Pushing branch ${branchName} to remote...`);
    try {
      execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error pushing to remote:', error);
      process.exit(1);
    }
  }
};

/**
 * Gets first commit message after main branch
 * @param branchName current branch name
 * @returns first commit message
 */
export const getFirstCommitMessage = (branchName: string): string => {
  console.log('📝 Extracting commit message for PR title...');
  return execSync(`git log main..${branchName} --format=%s --reverse | head -1`)
    .toString()
    .trim();
};
