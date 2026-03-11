# TickTick CLI

Command-line tool for [TickTick](https://ticktick.com), written in TypeScript. It maps directly to the 14 endpoints of [TickTick Open API v1](https://developer.ticktick.com/api#/openapi).

## Install

```bash
npm install -g @ticktick/ticktick-cli
```

From source (build and link globally):

```bash
git clone https://github.com/TickTeam/ticktick-cli.git
cd ticktick-cli
npm install
npm run build
npm link
```

After that, the `ticktick` command is available in your terminal.

## Authentication

OAuth (PKCE) is the recommended way—no client secret required:

```bash
ticktick auth login
```

Your browser will open for TickTick authorization.

Auth subcommands:

```bash
ticktick auth status   # see if you are logged in
ticktick auth logout   # clear the stored token
```

## Commands

### Tasks

```bash
# Fetch a task
ticktick task get <projectId> <taskId>

# Create a task
ticktick task create --title "Buy milk" --project <projectId>
ticktick task create --title "Meeting" --project <projectId> --priority 5 --due-date "2026-03-10T09:00:00+0000"

# Update a task
ticktick task update <taskId> --id <taskId> --project <projectId> --title "Updated title"

# Complete a task
ticktick task complete <projectId> <taskId>

# Delete a task
ticktick task delete <projectId> <taskId>

# Move tasks between projects
ticktick task move --from <sourceProjectId> --to <destProjectId> --task <taskId>

# List completed tasks
ticktick task completed --projects <projectId> --start-date "2026-03-01T00:00:00+0000" --end-date "2026-03-09T23:59:59+0000"

# Filter tasks
ticktick task filter --projects <projectId> --priority 3,5 --status 0
```

### Projects

```bash
ticktick project list                    # list all projects
ticktick project get <projectId>         # project details
ticktick project data <projectId>        # project with tasks and columns
ticktick project create --name "Work" --color "#F18181" --view-mode list --kind TASK
ticktick project update <projectId> --name "New Name" --color "#4AB8A9"
ticktick project delete <projectId>
```

### JSON output

Add `--json` to any command to get raw API JSON:

```bash
ticktick project list --json
ticktick task get <projectId> <taskId> --json
```

For all options: `ticktick --help` and `ticktick <command> --help`.

## API mapping

| Command | Endpoint |
|---|---|
| `task get` | `GET /project/{projectId}/task/{taskId}` |
| `task create` | `POST /task` |
| `task update` | `POST /task/{taskId}` |
| `task complete` | `POST /project/{projectId}/task/{taskId}/complete` |
| `task delete` | `DELETE /project/{projectId}/task/{taskId}` |
| `task move` | `POST /task/move` |
| `task completed` | `POST /task/completed` |
| `task filter` | `POST /task/filter` |
| `project list` | `GET /project` |
| `project get` | `GET /project/{projectId}` |
| `project data` | `GET /project/{projectId}/data` |
| `project create` | `POST /project` |
| `project update` | `POST /project/{projectId}` |
| `project delete` | `DELETE /project/{projectId}` |

## Development

```bash
npm install
npm run build       # compile
npm run dev         # watch mode
npm run type-check  # type check
npm test            # run tests
```

## License

MIT
