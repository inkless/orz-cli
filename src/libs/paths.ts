import envPaths from 'env-paths';
import { mkdirSync } from 'fs';
import { existsSync } from 'node:fs';
import { join, dirname, parse } from 'node:path';
import logger from './logger.js';

// Get platform-specific paths
export const paths = envPaths('orz-cli', { suffix: '' });

/**
 * Returns the data directory path, creating it if specified
 * @param options Configuration options
 * @returns The data directory path
 */
export function getDataDir(
  options: {
    create?: boolean;
  } = {},
): string {
  const { create = false } = options;
  const dataDir = paths.data;

  if (create) {
    try {
      // No need to check existence - recursive:true handles both cases efficiently
      mkdirSync(dataDir, { recursive: true });
      logger.log(`✅ Created data directory at ${dataDir}`);
    } catch (error) {
      logger.error(`Failed to create directory at ${dataDir}:`, error);
      // Don't throw - caller might be able to recover or handle differently
    }
  }

  return dataDir;
}

/**
 * Finds the project root directory by looking for common project files
 * Walks up the directory tree until it finds a recognizable project root
 * @returns The absolute path to the project root
 */
export function findProjectRoot(): string {
  let currentDir = process.cwd();

  // Common files/directories that indicate a project root
  const rootIndicators = ['.git', '.github'];

  // Walk up the directory tree until we find a root indicator or hit the filesystem root
  while (currentDir !== parse(currentDir).root) {
    if (
      rootIndicators.some((indicator) =>
        existsSync(join(currentDir, indicator)),
      )
    ) {
      return currentDir;
    }

    // Move up one directory
    currentDir = dirname(currentDir);
  }

  // If we couldn't find a project root, return the current working directory
  return process.cwd();
}

export const projectRoot = findProjectRoot();

// Export other path-related utilities as needed
export const configDir = paths.config;
export const cacheDir = paths.cache;
export const tempDir = paths.temp;
export const logDir = paths.log;
