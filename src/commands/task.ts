import chalk from 'chalk'
import { Command } from 'commander'
import { getApi } from '../lib/api.js'
import { formatJson, formatTaskRow, formatTaskView } from '../lib/output.js'
import type { ChecklistItem } from '../lib/types.js'

interface TaskCreateOptions {
  title: string
  project: string
  content?: string
  desc?: string
  allDay?: boolean
  startDate?: string
  dueDate?: string
  timeZone?: string
  reminders?: string
  repeat?: string
  priority?: string
  sortOrder?: string
  items?: string
  json?: boolean
}

interface TaskUpdateOptions {
  id: string
  project: string
  title?: string
  content?: string
  desc?: string
  allDay?: boolean
  startDate?: string
  dueDate?: string
  timeZone?: string
  reminders?: string
  repeat?: string
  priority?: string
  sortOrder?: string
  items?: string
  json?: boolean
}

interface FilterOptions {
  projects?: string
  startDate?: string
  endDate?: string
  priority?: string
  tag?: string
  status?: string
  json?: boolean
}

function parseItems(raw: string): ChecklistItem[] {
  try {
    return JSON.parse(raw)
  } catch {
    return raw.split(',').map((title) => ({ title: title.trim(), status: 0 }))
  }
}

function parseNumberList(raw: string): number[] {
  return raw.split(',').map((s) => parseInt(s.trim(), 10))
}

function parseStringList(raw: string): string[] {
  return raw.split(',').map((s) => s.trim())
}

async function getTask(
  projectId: string,
  taskId: string,
  options: { json?: boolean },
): Promise<void> {
  const api = await getApi()
  const task = await api.getTask(projectId, taskId)

  if (options.json) {
    console.log(formatJson(task))
    return
  }
  console.log(formatTaskView(task))
}

async function createTask(options: TaskCreateOptions): Promise<void> {
  const api = await getApi()
  const task = await api.createTask({
    title: options.title,
    projectId: options.project,
    content: options.content,
    desc: options.desc,
    isAllDay: options.allDay,
    startDate: options.startDate,
    dueDate: options.dueDate,
    timeZone: options.timeZone,
    reminders: options.reminders ? parseStringList(options.reminders) : undefined,
    repeatFlag: options.repeat,
    priority: options.priority ? parseInt(options.priority, 10) : undefined,
    sortOrder: options.sortOrder ? parseInt(options.sortOrder, 10) : undefined,
    items: options.items ? parseItems(options.items) : undefined,
  })

  if (options.json) {
    console.log(formatJson(task))
    return
  }
  console.log(`${chalk.green('Created:')} ${task.title}`)
  console.log(chalk.dim(`ID: ${task.id}`))
}

async function updateTask(taskId: string, options: TaskUpdateOptions): Promise<void> {
  const api = await getApi()
  const task = await api.updateTask(taskId, {
    id: options.id,
    projectId: options.project,
    title: options.title,
    content: options.content,
    desc: options.desc,
    isAllDay: options.allDay,
    startDate: options.startDate,
    dueDate: options.dueDate,
    timeZone: options.timeZone,
    reminders: options.reminders ? parseStringList(options.reminders) : undefined,
    repeatFlag: options.repeat,
    priority: options.priority ? parseInt(options.priority, 10) : undefined,
    sortOrder: options.sortOrder ? parseInt(options.sortOrder, 10) : undefined,
    items: options.items ? parseItems(options.items) : undefined,
  })

  if (options.json) {
    console.log(formatJson(task))
    return
  }
  console.log(`${chalk.green('Updated:')} ${task.title}`)
}

async function completeTask(projectId: string, taskId: string): Promise<void> {
  const api = await getApi()
  await api.completeTask(projectId, taskId)
  console.log(chalk.green('Task completed'))
}

async function deleteTask(projectId: string, taskId: string): Promise<void> {
  const api = await getApi()
  await api.deleteTask(projectId, taskId)
  console.log(chalk.green('Task deleted'))
}

async function moveTasks(options: {
  from: string[]
  to: string[]
  task: string[]
  json?: boolean
}): Promise<void> {
  if (options.from.length !== options.to.length || options.from.length !== options.task.length) {
    throw new Error('--from, --to, and --task must be specified the same number of times')
  }

  const moves = options.from.map((fromProjectId, i) => ({
    fromProjectId,
    toProjectId: options.to[i],
    taskId: options.task[i],
  }))

  const api = await getApi()
  const results = await api.moveTasks(moves)

  if (options.json) {
    console.log(formatJson(results))
    return
  }
  for (const r of results) {
    console.log(`${chalk.green('Moved:')} ${r.id}`)
  }
}

async function listCompleted(options: FilterOptions): Promise<void> {
  const api = await getApi()
  const tasks = await api.getCompletedTasks({
    projectIds: options.projects ? parseStringList(options.projects) : undefined,
    startDate: options.startDate,
    endDate: options.endDate,
  })

  if (options.json) {
    console.log(formatJson(tasks))
    return
  }
  if (tasks.length === 0) {
    console.log('No completed tasks found.')
    return
  }
  for (const task of tasks) {
    console.log(formatTaskRow(task))
  }
}

async function filterTasksCmd(options: FilterOptions): Promise<void> {
  const api = await getApi()
  const tasks = await api.filterTasks({
    projectIds: options.projects ? parseStringList(options.projects) : undefined,
    startDate: options.startDate,
    endDate: options.endDate,
    priority: options.priority ? parseNumberList(options.priority) : undefined,
    tag: options.tag ? parseStringList(options.tag) : undefined,
    status: options.status ? parseNumberList(options.status) : undefined,
  })

  if (options.json) {
    console.log(formatJson(tasks))
    return
  }
  if (tasks.length === 0) {
    console.log('No tasks match the filter.')
    return
  }
  for (const task of tasks) {
    console.log(formatTaskRow(task))
  }
}

export function registerTaskCommand(program: Command): void {
  const task = program.command('task').description('Create, update, and query tasks')

  // GET /project/{projectId}/task/{taskId}
  task
    .command('get <projectId> <taskId>')
    .description('Fetch a task by project and task ID')
    .option('--json', 'Output as JSON')
    .action(getTask)

  // POST /task
  const createCmd = task
    .command('create')
    .description('Create a task')
    .requiredOption('--title <title>', 'Task title')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--content <content>', 'Task content')
    .option('--desc <desc>', 'Description of checklist')
    .option('--all-day', 'All day task')
    .option('--start-date <date>', 'Start date (yyyy-MM-ddTHH:mm:ssZ)')
    .option('--due-date <date>', 'Due date (yyyy-MM-ddTHH:mm:ssZ)')
    .option('--time-zone <tz>', 'Time zone')
    .option('--reminders <triggers>', 'Comma-separated reminder triggers')
    .option('--repeat <rule>', 'Recurring rule (RRULE format)')
    .option('--priority <n>', 'Priority: 0=None, 1=Low, 3=Medium, 5=High')
    .option('--sort-order <n>', 'Sort order')
    .option('--items <json|csv>', 'Subtasks as JSON array or comma-separated titles')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      await createTask(options)
    })

  // POST /task/{taskId}
  task
    .command('update <taskId>')
    .description('Update a task')
    .requiredOption('--id <id>', 'Task ID (in body)')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--title <title>', 'Task title')
    .option('--content <content>', 'Task content')
    .option('--desc <desc>', 'Description of checklist')
    .option('--all-day', 'All day task')
    .option('--start-date <date>', 'Start date (yyyy-MM-ddTHH:mm:ssZ)')
    .option('--due-date <date>', 'Due date (yyyy-MM-ddTHH:mm:ssZ)')
    .option('--time-zone <tz>', 'Time zone')
    .option('--reminders <triggers>', 'Comma-separated reminder triggers')
    .option('--repeat <rule>', 'Recurring rule (RRULE format)')
    .option('--priority <n>', 'Priority: 0=None, 1=Low, 3=Medium, 5=High')
    .option('--sort-order <n>', 'Sort order')
    .option('--items <json|csv>', 'Subtasks as JSON array or comma-separated titles')
    .option('--json', 'Output as JSON')
    .action(updateTask)

  // POST /project/{projectId}/task/{taskId}/complete
  task
    .command('complete <projectId> <taskId>')
    .description('Complete a task')
    .action(completeTask)

  // DELETE /project/{projectId}/task/{taskId}
  task
    .command('delete <projectId> <taskId>')
    .description('Delete a task')
    .action(deleteTask)

  // POST /task/move
  task
    .command('move')
    .description('Move tasks between projects')
    .requiredOption('--from <projectId...>', 'Source project ID(s)')
    .requiredOption('--to <projectId...>', 'Destination project ID(s)')
    .requiredOption('--task <taskId...>', 'Task ID(s) to move')
    .option('--json', 'Output as JSON')
    .action(moveTasks)

  // POST /task/completed
  task
    .command('completed')
    .description('List completed tasks')
    .option('--projects <ids>', 'Comma-separated project IDs')
    .option('--start-date <date>', 'Start date filter (yyyy-MM-ddTHH:mm:ssZ)')
    .option('--end-date <date>', 'End date filter (yyyy-MM-ddTHH:mm:ssZ)')
    .option('--json', 'Output as JSON')
    .action(listCompleted)

  // POST /task/filter
  task
    .command('filter')
    .description('Filter tasks with advanced criteria')
    .option('--projects <ids>', 'Comma-separated project IDs')
    .option('--start-date <date>', 'Filter by start date')
    .option('--end-date <date>', 'Filter by end date')
    .option('--priority <levels>', 'Comma-separated priority levels (0,1,3,5)')
    .option('--tag <tags>', 'Comma-separated tags')
    .option('--status <codes>', 'Comma-separated status codes (0=Open, 2=Completed)')
    .option('--json', 'Output as JSON')
    .action(filterTasksCmd)
}
