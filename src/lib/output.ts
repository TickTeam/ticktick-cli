import chalk from 'chalk'
import type { Project, ProjectData, Task } from './types.js'

const PRIORITY_LABELS: Record<number, string> = {
  0: 'None',
  1: 'Low',
  3: 'Medium',
  5: 'High',
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Open',
  2: 'Completed',
}

function priorityColor(priority: number): (s: string) => string {
  switch (priority) {
    case 5:
      return chalk.red
    case 3:
      return chalk.yellow
    case 1:
      return chalk.blue
    default:
      return chalk.dim
  }
}

export function formatTaskRow(task: Task): string {
  const pColor = priorityColor(task.priority)
  const pLabel = PRIORITY_LABELS[task.priority] ?? String(task.priority)
  const status = task.status === 2 ? chalk.green('[done]') : ''
  const due = task.dueDate ? chalk.dim(` due:${task.dueDate}`) : ''
  return `  ${chalk.dim(task.id)} ${pColor(`[${pLabel}]`)} ${task.title}${due} ${status}`.trimEnd()
}

export function formatTaskView(task: Task): string {
  const lines: string[] = []
  lines.push(chalk.bold(task.title))
  lines.push('')
  lines.push(`ID:        ${task.id}`)
  lines.push(`Project:   ${task.projectId}`)
  lines.push(`Priority:  ${PRIORITY_LABELS[task.priority] ?? task.priority}`)
  lines.push(`Status:    ${STATUS_LABELS[task.status] ?? task.status}`)
  if (task.content) lines.push(`Content:   ${task.content}`)
  if (task.desc) lines.push(`Desc:      ${task.desc}`)
  if (task.startDate) lines.push(`Start:     ${task.startDate}`)
  if (task.dueDate) lines.push(`Due:       ${task.dueDate}`)
  if (task.timeZone) lines.push(`Timezone:  ${task.timeZone}`)
  if (task.repeatFlag) lines.push(`Repeat:    ${task.repeatFlag}`)
  if (task.completedTime) lines.push(`Completed: ${task.completedTime}`)
  if (task.kind) lines.push(`Kind:      ${task.kind}`)
  if (task.tags?.length) lines.push(`Tags:      ${task.tags.join(', ')}`)
  if (task.reminders?.length) lines.push(`Reminders: ${task.reminders.join(', ')}`)
  if (task.items?.length) {
    lines.push('')
    lines.push(chalk.dim(`--- Subtasks (${task.items.length}) ---`))
    for (const item of task.items) {
      const check = item.status === 1 ? chalk.green('[x]') : '[ ]'
      lines.push(`  ${check} ${item.title}`)
    }
  }
  return lines.join('\n')
}

export function formatProjectRow(project: Project): string {
  const closed = project.closed ? chalk.dim(' [closed]') : ''
  const color = project.color ? chalk.dim(` ${project.color}`) : ''
  return `  ${chalk.dim(project.id)} ${project.name}${color}${closed}`
}

export function formatProjectView(data: ProjectData): string {
  const { project, tasks, columns } = data
  const lines: string[] = []
  lines.push(chalk.bold(project.name))
  lines.push('')
  lines.push(`ID:        ${project.id}`)
  if (project.color) lines.push(`Color:     ${project.color}`)
  if (project.viewMode) lines.push(`View:      ${project.viewMode}`)
  if (project.kind) lines.push(`Kind:      ${project.kind}`)
  if (project.groupId) lines.push(`Group:     ${project.groupId}`)
  lines.push(`Closed:    ${project.closed ? 'Yes' : 'No'}`)

  if (columns.length > 0) {
    lines.push('')
    lines.push(chalk.dim(`--- Columns (${columns.length}) ---`))
    for (const col of columns) {
      lines.push(`  ${chalk.dim(col.id)} ${col.name}`)
    }
  }

  if (tasks.length > 0) {
    lines.push('')
    lines.push(chalk.dim(`--- Tasks (${tasks.length}) ---`))
    for (const task of tasks) {
      lines.push(formatTaskRow(task))
    }
  }

  return lines.join('\n')
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2)
}
