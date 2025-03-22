// Node.js core modules
import { Buffer } from 'node:buffer';

// Internal imports
import { getJiraConfig, getJiraApiToken } from './setup.js';
import { request } from '../request.js';

/**
 * Jira API configuration
 */
interface JiraConfig {
  baseUrl: string;
  username: string;
  apiToken: string;
}

/**
 * Jira issue type
 */
export interface JiraIssueType {
  id: string;
  name: string;
}

/**
 * Jira issue creation parameters
 */
interface CreateJiraIssueParams {
  projectKey: string;
  summary: string;
  description: string;
  issueType: JiraIssueType | string;
  labels?: string[];
  components?: string[];
  assignee?: string;
  parentKey?: string;
}

/**
 * Jira issue response type
 */
interface JiraIssueResponse {
  id: string;
  key: string;
  self: string;
}

/**
 * Jira project response type
 */
interface JiraProjectResponse {
  id: string;
  key: string;
  name: string;
  issueTypes: JiraIssueType[];
}

/**
 * Converts plain text to Atlassian Document Format (ADF)
 * @param text Plain text to convert
 * @returns ADF document
 */
function textToADF(text: string) {
  return {
    version: 1,
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: text,
          },
        ],
      },
    ],
  };
}

/**
 * Jira API client
 */
export class JiraClient {
  private config: JiraConfig;
  private authHeader: string;

  /**
   * Creates a new Jira client instance
   * @param config Jira API configuration
   */
  constructor(config: JiraConfig) {
    this.config = config;

    // Create auth header from credentials
    const auth = Buffer.from(
      `${this.config.username}:${this.config.apiToken}`,
    ).toString('base64');
    this.authHeader = `Basic ${auth}`;
  }

  /**
   * Gets the Jira base URL
   */
  get baseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Creates a Jira client from stored secrets
   * @returns JiraClient instance or null if secrets are not set up
   */
  static getInstance(): JiraClient {
    const config = getJiraConfig();
    const apiToken = getJiraApiToken();

    if (!config.username || !config.url || !apiToken) {
      throw new Error('Jira credentials not found in secrets');
    }

    return new JiraClient({
      baseUrl: config.url,
      username: config.username,
      apiToken,
    });
  }

  /**
   * Creates a new Jira issue
   * @param params Issue creation parameters
   * @returns Created issue or null if failed
   */
  async createIssue(
    params: CreateJiraIssueParams,
  ): Promise<JiraIssueResponse | null> {
    const {
      projectKey,
      summary,
      description,
      issueType,
      labels = [],
      components = [],
      assignee,
      parentKey,
    } = params;

    // Handle issueType as string or object
    const issueTypeId =
      typeof issueType === 'string' ? issueType : issueType.id;

    const requestBody = {
      fields: {
        project: {
          key: projectKey,
        },
        summary,
        description: textToADF(description),
        issuetype: {
          id: issueTypeId,
        },
        labels,
        components: components.map((name) => ({ name })),
        ...(assignee ? { assignee: { name: assignee } } : {}),
        ...(parentKey ? { parent: { key: parentKey } } : {}),
      },
    };

    return request<JiraIssueResponse>({
      baseUrl: this.config.baseUrl,
      endpoint: '/rest/api/3/issue',
      method: 'POST',
      body: requestBody,
      headers: {
        Authorization: this.authHeader,
      },
    });
  }

  /**
   * Gets available issue types for a project
   * @param projectKey Jira project key
   * @returns List of issue types or null if failed
   */
  async getIssueTypes(projectKey: string): Promise<JiraIssueType[]> {
    const projectData = await request<JiraProjectResponse>({
      baseUrl: this.config.baseUrl,
      endpoint: `/rest/api/3/project/${projectKey}`,
      headers: {
        Authorization: this.authHeader,
      },
    });

    return projectData?.issueTypes || [];
  }

  /**
   * Gets project information
   * @param projectKey Jira project key
   * @returns Project information or null if failed
   */
  async getProject(projectKey: string): Promise<JiraProjectResponse | null> {
    return request<JiraProjectResponse>({
      baseUrl: this.config.baseUrl,
      endpoint: `/rest/api/3/project/${projectKey}`,
      headers: {
        Authorization: this.authHeader,
      },
    });
  }
}
