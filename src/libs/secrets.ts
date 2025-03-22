import { writeFileSync, existsSync, chmodSync, readFileSync } from 'fs';
import { join } from 'path';
import { confirm, password } from '@inquirer/prompts';
import { getDataDir } from './paths.js';

/**
 * Manages storage and retrieval of secure API keys
 * @param keyName Name of the key (used for filename and prompt)
 * @param force Whether to force update an existing key
 * @param options Additional options
 * @returns Promise resolving to true if key was set, false otherwise
 */
export async function setupApiKey(
  keyName: string,
  force: boolean,
  options: {
    promptMessage?: string;
    successMessage?: string;
    skipMessage?: string;
  } = {},
): Promise<boolean> {
  const dataDir = getDataDir();
  const {
    promptMessage = `Enter your ${keyName}:`,
    successMessage = `✅ ${keyName} stored successfully (read-only)!`,
    skipMessage = `⚠️ No ${keyName} provided. Skipping key setup.`,
  } = options;

  // Check if key exists
  const keyPath = join(dataDir, `${keyName}.txt`);
  let shouldSetKey = true;

  try {
    if (existsSync(keyPath) && !force) {
      const updateKey = await confirm({
        message: `${keyName} already exists. Update it?`,
        default: false,
      });

      if (!updateKey) {
        console.log(`ℹ️ Using existing ${keyName}.`);
        shouldSetKey = false;
      }
    }

    // Only prompt for API key if needed
    if (shouldSetKey) {
      const apiKey = await password({
        message: promptMessage,
        mask: '*',
      });

      if (apiKey) {
        try {
          writeFileSync(keyPath, apiKey);
          // Make the file readable and writable only by the owner (standard for credential files)
          chmodSync(keyPath, 0o600);
          console.log(successMessage);
          return true;
        } catch (error) {
          console.error(`Failed to save ${keyName}:`, error);
          return false;
        }
      } else {
        console.log(skipMessage);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error(`Error setting up ${keyName}:`, error);
    return false;
  }
}

/**
 * Reads an API key from the stored secrets
 * @param keyName Name of the key (used for filename)
 * @returns The API key as a string, or null if not found
 */
export function getApiKey(keyName: string): string | null {
  const dataDir = getDataDir();
  const keyPath = join(dataDir, `${keyName}.txt`);

  try {
    if (!existsSync(keyPath)) {
      console.error(`⚠️ ${keyName} not found. Please set it up first.`);
      return null;
    }

    return readFileSync(keyPath, 'utf8').trim();
  } catch (error) {
    console.error(`Error reading ${keyName}:`, error);
    return null;
  }
}
