import chalk from 'chalk'
import { Command } from 'commander'
import { getApi } from '../lib/api.js'
import { formatJson, formatProjectRow, formatProjectView } from '../lib/output.js'

interface ProjectCreateOptions {
  name: string
  color?: string
  sortOrder?: string
  viewMode?: string
  kind?: string
  json?: boolean
}

interface ProjectUpdateOptions {
  name?: string
  color?: string
  sortOrder?: string
  viewMode?: string
  kind?: string
  json?: boolean
}

async function listProjects(options: { json?: boolean }): Promise<void> {
  const api = await getApi()
  const projects = await api.getProjects()

  if (options.json) {
    console.log(formatJson(projects))
    return
  }
  if (projects.length === 0) {
    console.log('No projects found.')
    return
  }
  for (const project of projects) {
    console.log(formatProjectRow(project))
  }
}

async function getProject(
  projectId: string,
  options: { json?: boolean },
): Promise<void> {
  const api = await getApi()
  const project = await api.getProject(projectId)

  if (options.json) {
    console.log(formatJson(project))
    return
  }
  console.log(chalk.bold(project.name))
  console.log('')
  console.log(`ID:        ${project.id}`)
  if (project.color) console.log(`Color:     ${project.color}`)
  if (project.viewMode) console.log(`View:      ${project.viewMode}`)
  if (project.kind) console.log(`Kind:      ${project.kind}`)
  if (project.groupId) console.log(`Group:     ${project.groupId}`)
  console.log(`Closed:    ${project.closed ? 'Yes' : 'No'}`)
}

async function getProjectData(
  projectId: string,
  options: { json?: boolean },
): Promise<void> {
  const api = await getApi()
  const data = await api.getProjectWithData(projectId)

  if (options.json) {
    console.log(formatJson(data))
    return
  }
  console.log(formatProjectView(data))
}

async function createProject(options: ProjectCreateOptions): Promise<void> {
  const api = await getApi()
  const project = await api.createProject({
    name: options.name,
    color: options.color,
    sortOrder: options.sortOrder ? parseInt(options.sortOrder, 10) : undefined,
    viewMode: options.viewMode,
    kind: options.kind,
  })

  if (options.json) {
    console.log(formatJson(project))
    return
  }
  console.log(`${chalk.green('Created:')} ${project.name}`)
  console.log(chalk.dim(`ID: ${project.id}`))
}

async function updateProject(
  projectId: string,
  options: ProjectUpdateOptions,
): Promise<void> {
  const api = await getApi()
  const project = await api.updateProject(projectId, {
    name: options.name,
    color: options.color,
    sortOrder: options.sortOrder ? parseInt(options.sortOrder, 10) : undefined,
    viewMode: options.viewMode,
    kind: options.kind,
  })

  if (options.json) {
    console.log(formatJson(project))
    return
  }
  console.log(`${chalk.green('Updated:')} ${project.name}`)
}

async function deleteProject(projectId: string): Promise<void> {
  const api = await getApi()
  await api.deleteProject(projectId)
  console.log(chalk.green('Project deleted'))
}

export function registerProjectCommand(program: Command): void {
  const project = program.command('project').description('List and manage projects')

  // GET /project
  project
    .command('list')
    .description('List projects')
    .option('--json', 'Output as JSON')
    .action(listProjects)

  // GET /project/{projectId}
  project
    .command('get <projectId>')
    .description('Fetch project by ID')
    .option('--json', 'Output as JSON')
    .action(getProject)

  // GET /project/{projectId}/data
  project
    .command('data <projectId>')
    .description('Fetch project with tasks and columns')
    .option('--json', 'Output as JSON')
    .action(getProjectData)

  // POST /project
  project
    .command('create')
    .description('Create a project')
    .requiredOption('--name <name>', 'Project name')
    .option('--color <color>', 'Project color (e.g. "#F18181")')
    .option('--sort-order <n>', 'Sort order')
    .option('--view-mode <mode>', 'View mode: list, kanban, timeline')
    .option('--kind <kind>', 'Project kind: TASK, NOTE')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      await createProject(options)
    })

  // POST /project/{projectId}
  project
    .command('update <projectId>')
    .description('Update project fields')
    .option('--name <name>', 'Project name')
    .option('--color <color>', 'Project color')
    .option('--sort-order <n>', 'Sort order')
    .option('--view-mode <mode>', 'View mode: list, kanban, timeline')
    .option('--kind <kind>', 'Project kind: TASK, NOTE')
    .option('--json', 'Output as JSON')
    .action(updateProject)

  // DELETE /project/{projectId}
  project
    .command('delete <projectId>')
    .description('Delete a project')
    .action(deleteProject)
}
