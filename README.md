# orz-cli

A command-line interface (CLI) tool for streamlining development workflows.

## Features

- Create GitHub pull requests with automated Jira ticket creation
- Create Jira tickets with customizable fields
- Configure and manage project settings
- Simple command interface with interactive prompts

## Installation

```bash
# Clone the repository
git clone [repository-url]
cd orz-cli

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Link the CLI globally
pnpm link --global
```

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

### `hello [name]`

A simple greeting command (example/test command).

Options:

- `-u, --uppercase` - Output the greeting in uppercase

### `setup`

Configure the CLI tool with required settings (Jira credentials, GitHub CLI check).

Options:

- `-f, --force` - Force setup even if configuration already exists

### `gh-pull-request`

Create a GitHub pull request with the current branch changes.

Options:

- `-j, --jira` - Create a Jira ticket for this PR (default: true)
- `--jira-project <jiraProject>` - Jira project key (default: MOBILEPLAT)
- `--jira-type <jiraType>` - Jira issue type

### `create-jira-ticket`

Create a Jira ticket with specified details.

Options:

- `-p, --project <project>` - Jira project key (default: MOBILEPLAT)
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

Private
