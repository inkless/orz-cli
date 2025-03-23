import { vi } from 'vitest';

// Mock env-paths to avoid ES module issues
vi.mock('env-paths', () => ({
  default: vi.fn().mockReturnValue({
    data: '/mock/data/path',
    config: '/mock/config/path',
    cache: '/mock/cache/path',
    log: '/mock/log/path',
    temp: '/mock/temp/path',
  }),
}));

vi.mock('@inquirer/prompts');

vi.mock('./src/libs/logger.js');
vi.mock('./src/libs/request.js');
