# TickTick CLI

Command-line tool for [TickTick](https://ticktick.com), written in TypeScript. It wraps [TickTick Open API v1](https://developer.ticktick.com/api#/openapi) with a convenient CLI.

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

| Command          | Endpoint                                           |
| ---------------- | -------------------------------------------------- |
| `task get`       | `GET /project/{projectId}/task/{taskId}`           |
| `task create`    | `POST /task`                                       |
| `task update`    | `POST /task/{taskId}`                              |
| `task complete`  | `POST /project/{projectId}/task/{taskId}/complete` |
| `task delete`    | `DELETE /project/{projectId}/task/{taskId}`        |
| `task move`      | `POST /task/move`                                  |
| `task completed` | `POST /task/completed`                             |
| `task filter`    | `POST /task/filter`                                |
| `project list`   | `GET /project`                                     |
| `project get`    | `GET /project/{projectId}`                         |
| `project data`   | `GET /project/{projectId}/data`                    |
| `project create` | `POST /project`                                    |
| `project update` | `POST /project/{projectId}`                        |
| `project delete` | `DELETE /project/{projectId}`                      |

## JSON fields and CLI mapping

The **API mapping** table shows which HTTP calls each command uses. With **`--json`** (see [JSON output](#json-output)), the CLI prints the same objects the API returns—field names are **camelCase**. **`task create`** / **`task update`** send the same field names in the request body, aligned with their long options below.

### Task

Appears in **`task get … --json`**, **`task create` / `task update` with `--json`**, each line of **`task completed` / `task filter` with `--json`**, and under `tasks` in **`project data … --json`**.

| Field                     | Meaning                                                           | CLI (create / update)                           |
| ------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `id`                      | Task id (hex ObjectId string)                                     | `update` only: positional `<taskId>` and `--id` |
| `projectId`               | Owning project                                                    | `--project`                                     |
| `sortOrder`               | Order in the list                                                 | `--sort-order`                                  |
| `title`                   | Short title; use `content` for longer text                        | `--title`                                       |
| `content`                 | Main body for normal/note-style tasks                             | `--content`                                     |
| `desc`                    | Description for checklist-style tasks                             | `--desc`                                        |
| `startDate` / `dueDate`   | Schedule; if `dueDate` ≠ `startDate`, the API treats it as a span | `--start-date`, `--due-date`                    |
| `timeZone`                | Time zone                                                         | `--time-zone`                                   |
| `isAllDay`                | All-day task                                                      | `--all-day`                                     |
| `priority`                | `0` none, `1` low, `3` medium, `5` high                           | `--priority`                                    |
| `reminders`               | Reminder triggers                                                 | `--reminders`                                   |
| `repeatFlag`              | Recurrence rule                                                   | `--repeat`                                      |
| `completedTime`           | When completed                                                    | —                                               |
| `status`                  | `0` open, `-1` abandoned, `2` completed                           | —                                               |
| `items`                   | Checklist items                                                   | `--items` (see **Checklist item**)              |
| `tags`                    | Tags                                                              | —                                               |
| `columnId` / `columnName` | Kanban column                                                     | —                                               |
| `parentId` / `childIds`   | Subtask links                                                     | —                                               |
| `assignor`                | Assignor metadata                                                 | —                                               |
| `etag`                    | Optimistic locking on the server                                  | —                                               |
| `kind`                    | e.g. `TASK`, `NOTE`, or `CHECKLIST`                               | —                                               |

### Checklist item (`items[]`)

For checklist-style tasks, each entry in `items` is one **checklist item**:

| Field                                                | Meaning                          |
| ---------------------------------------------------- | -------------------------------- |
| `id`                                                 | Checklist item id (hex ObjectId) |
| `status`                                             | `0` not done, `1` done           |
| `title`                                              | Checklist item text              |
| `sortOrder`                                          | Order among checklist items      |
| `startDate`, `isAllDay`, `timeZone`, `completedTime` | Optional time metadata           |

### Project

Returned by **`project list` / `project get --json`** and as `project` inside **`project data --json`**. **`project create`** / **`project update`** set the same kind of fields.

| Field        | Meaning                         | CLI                                        |
| ------------ | ------------------------------- | ------------------------------------------ |
| `id`         | Project id (hex ObjectId)       | `get`, `update`, `data`, `delete` argument |
| `name`       | Display name                    | `--name`                                   |
| `color`      | Color                           | `--color`                                  |
| `sortOrder`  | Sidebar order                   | —                                          |
| `closed`     | Closed/archived                 | —                                          |
| `groupId`    | Group/folder id                 | —                                          |
| `viewMode`   | `list`, `kanban`, or `timeline` | `--view-mode`                              |
| `permission` | `read`, `comment`, or `write`   | —                                          |
| `kind`       | `TASK` or `NOTE`                | `--kind`                                   |

### Kanban column (`columns[]`)

Inside **`project data … --json`**, array `columns`:

| Field       | Meaning                  |
| ----------- | ------------------------ |
| `id`        | Column id (hex ObjectId) |
| `projectId` | Owning project           |
| `name`      | Column title             |
| `sortOrder` | Order on the board       |

### `project data` root

| Field     | Meaning                                     |
| --------- | ------------------------------------------- |
| `project` | One **Project** object                      |
| `tasks`   | Incomplete **Task** objects in that project |
| `columns` | **Kanban columns** for that project         |

### `task completed` body

Maps to **`task completed`** options (see **API mapping** → `POST /task/completed`):

| JSON field              | Flag                                    |
| ----------------------- | --------------------------------------- |
| `projectIds`            | `--projects` (comma-separated)          |
| `startDate` / `endDate` | `--start-date`, `--end-date` (ISO 8601) |

### `task filter` body

Maps to **`task filter`** options (`POST /task/filter`):

| JSON field              | Flag                                                       |
| ----------------------- | ---------------------------------------------------------- |
| `projectIds`            | `--projects`                                               |
| `startDate` / `endDate` | `--start-date`, `--end-date`                               |
| `priority`              | `--priority` (comma-separated: `0`, `1`, `3`, `5`)         |
| `tag`                   | `--tag` (comma-separated)                                  |
| `status`                | `--status` (comma-separated; e.g. `0` open, `2` completed) |

### `task move` body

Each repetition of **`--from`**, **`--to`**, and **`--task`** (same count) becomes one object with `fromProjectId`, `toProjectId`, and `taskId`. The API allows an optional `sortOrder` in the destination list; the CLI does not set it.

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
