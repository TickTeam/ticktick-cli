// TickTick Open API v1 data models
// https://developer.ticktick.com/api#/openapi

export interface ChecklistItem {
  id?: string
  title: string
  status?: number // 0 = Normal, 1 = Completed
  completedTime?: string
  isAllDay?: boolean
  sortOrder?: number
  startDate?: string
  timeZone?: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  content?: string
  desc?: string
  isAllDay?: boolean
  startDate?: string
  dueDate?: string
  timeZone?: string
  reminders?: string[]
  repeatFlag?: string
  priority: number // 0 = None, 1 = Low, 3 = Medium, 5 = High
  status: number // 0 = Normal, 2 = Completed
  completedTime?: string
  sortOrder?: number
  items?: ChecklistItem[]
  tags?: string[]
  etag?: string
  kind?: string // TEXT, NOTE, CHECKLIST
}

export interface Project {
  id: string
  name: string
  color?: string
  sortOrder?: number
  closed?: boolean
  groupId?: string
  viewMode?: string // list, kanban, timeline
  permission?: string // read, write, comment
  kind?: string // TASK, NOTE
}

export interface Column {
  id: string
  projectId: string
  name: string
  sortOrder?: number
}

export interface ProjectData {
  project: Project
  tasks: Task[]
  columns: Column[]
}

// Input types for create/update operations

export interface CreateTaskInput {
  title: string
  projectId: string
  content?: string
  desc?: string
  isAllDay?: boolean
  startDate?: string
  dueDate?: string
  timeZone?: string
  reminders?: string[]
  repeatFlag?: string
  priority?: number
  sortOrder?: number
  items?: ChecklistItem[]
}

export interface UpdateTaskInput {
  id: string
  projectId: string
  title?: string
  content?: string
  desc?: string
  isAllDay?: boolean
  startDate?: string
  dueDate?: string
  timeZone?: string
  reminders?: string[]
  repeatFlag?: string
  priority?: number
  sortOrder?: number
  items?: ChecklistItem[]
}

export interface MoveTaskInput {
  fromProjectId: string
  toProjectId: string
  taskId: string
}

export interface MoveTaskResult {
  id: string
  etag: string
}

export interface CompletedTaskFilter {
  projectIds?: string[]
  startDate?: string
  endDate?: string
}

export interface TaskFilter {
  projectIds?: string[]
  startDate?: string
  endDate?: string
  priority?: number[]
  tag?: string[]
  status?: number[]
}

export interface CreateProjectInput {
  name: string
  color?: string
  sortOrder?: number
  viewMode?: string
  kind?: string
}

export interface UpdateProjectInput {
  name?: string
  color?: string
  sortOrder?: number
  viewMode?: string
  kind?: string
}
