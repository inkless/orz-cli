# orz-cli

A command-line interface (CLI) tool for streamlining development workflows.

## Features

- Create GitHub pull requests with automated Jira ticket creation
- Create Jira tickets with customizable fields
- Configure and manage project settings
- Simple command interface with interactive prompts

## Installation

### Use npm/pnpm/yarn

```bash
# Install through npm
npm install -g orz-cli

# Install through pnpm
pnpm install -g orz-cli

# Install through yarn
yarn global add orz-cli
```

### Use git repository directly

```bash
# Clone the repository
git clone [repository-url]
cd orz-cli

# Install dependencies
pnpm install

# Link the CLI globally
pnpm link --global
```

## Setup

The CLI requires configuration for Jira integration. Run the setup command to configure required settings:

```bash
# Initialize the CLI configuration
orz-cli setup
```

During setup, you'll be prompted to provide:

- Your Jira username (email)
- Your Jira URL (e.g., https://your-domain.atlassian.net)
- Your default Jira project key
- Your Jira API token (stored securely)

The setup also checks if GitHub CLI (`gh`) is installed, which is required for PR creation functionality.

### Configuration Files

The CLI stores configuration in platform-specific locations:

- macOS: `~/Library/Application Support/orz-cli/`
- Windows: `%APPDATA%/orz-cli/`
- Linux: `~/.local/share/orz-cli/`

#### jira_config.json

The `jira_config.json` file stores your Jira configuration and is created automatically during setup. It contains:

```json
{
  "username": "your-jira-email@example.com",
  "url": "https://your-domain.atlassian.net",
  "defaultProjectKey": "PROJ",
  "supportedIssueTypes": ["Story", "Task", "Sub-task"],
  "parentEpicChoices": [
    { "name": "My Epic", "value": "PROJ-2" },
    { "name": "My Epic 2", "value": "PROJ-3" }
  ],
  "parentStoryChoices": [{ "name": "My Task", "value": "PROJ-3" }],
  "accountId": "your-account-id",
  "autoAssign": true
}
```

Your Jira API token is stored separately in a secure file and is not included in this JSON file.

You can modify this file manually if needed, or run `orz-cli setup --force` to recreate it.

## Usage

```bash
# Show help and available commands
orz-cli --help

# Run the setup command to configure required settings
orz-cli setup

# Create a GitHub pull request with the current branch changes
orz-cli gh-pull-request

# Create a Jira ticket
orz-cli create-jira-ticket
```

## Available Commands

### `setup`

Configure the CLI tool with required settings (Jira credentials, GitHub CLI check).

Options:

- `-f, --force` - Force setup even if configuration already exists

### `gh-pull-request`

Create a GitHub pull request with the current branch changes.

Options:

- `-j, --jira` - Create a Jira ticket for this PR (default: true)
- `--jira-project <jiraProject>` - Jira project key (default: Your Jira Config)
- `--jira-type <jiraType>` - Jira issue type

### `create-jira-ticket`

Create a Jira ticket with specified details.

Options:

- `-p, --project <project>` - Jira project key (default: Your Jira Config)
- `-s, --summary <summary>` - Issue summary
- `-d, --description <description>` - Issue description
- `-t, --type <type>` - Issue type (e.g., Bug, Task, Story)
- `-l, --labels <labels>` - Comma-separated list of labels

## Development

```bash
# Build in watch mode
pnpm run build:watch

# Run tests
pnpm test

# Check code formatting
pnpm run prettier

# Run linter
pnpm run lint

# Check types
pnpm run type-check
```

## Requirements

- Node.js v18 or higher
- GitHub CLI (`gh`) installed for PR creation functionality
- Jira account for ticket creation functionality

## License

MIT License. See the [LICENSE](./LICENSE) file for details.

```

```
