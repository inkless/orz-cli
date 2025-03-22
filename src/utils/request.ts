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
  baseUrl: string;
  endpoint: string;
  body?: object;
  headers?: Record<string, string>;
}

/**
 * Makes a request to an API
 * @param options Request options
 * @returns Response data or null if request failed
 */
export async function request<T>(options: RequestOptions): Promise<T | null> {
  const { method = 'GET', baseUrl, endpoint, body, headers = {} } = options;
  const url = `${baseUrl}${endpoint}`;

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
      console.error(`❌ Failed request to ${endpoint}:`, errorData);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`❌ Error making request to ${endpoint}:`, error);
    return null;
  }
}
