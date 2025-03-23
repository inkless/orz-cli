import logger from './logger.js';

/**
 * Base request configuration
 */
export interface RequestConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

/**
 * Request options
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: object;
  headers?: Record<string, string>;
}

/**
 * Makes a request to an API
 * @param options Request options
 * @returns Response data or null if request failed
 */
export async function request<T>(options: RequestOptions): Promise<T | null> {
  const { method = 'GET', url, body, headers = {} } = options;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as Record<string, unknown>;
      logger.error(`❌ Failed request to ${url}:`, errorData);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    logger.error(`❌ Error making request to ${url}:`, error);
    return null;
  }
}
