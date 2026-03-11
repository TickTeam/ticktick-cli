import { getAccessToken } from './auth.js'
import type {
  CompletedTaskFilter,
  CreateProjectInput,
  CreateTaskInput,
  MoveTaskInput,
  MoveTaskResult,
  Project,
  ProjectData,
  Task,
  TaskFilter,
  UpdateProjectInput,
  UpdateTaskInput,
} from './types.js'

const BASE_URL = 'https://api.ticktick.com/open/v1'

class TickTickApi {
  constructor(private token: string) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${path}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`TickTick API error ${response.status}: ${text}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>
    }
    return undefined as T
  }

  // --- Task (8 endpoints) ---

  /** GET /open/v1/project/{projectId}/task/{taskId} */
  async getTask(projectId: string, taskId: string): Promise<Task> {
    return this.request<Task>(`/project/${projectId}/task/${taskId}`)
  }

  /** POST /open/v1/task */
  async createTask(input: CreateTaskInput): Promise<Task> {
    return this.request<Task>('/task', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  /** POST /open/v1/task/{taskId} */
  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    return this.request<Task>(`/task/${taskId}`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  /** POST /open/v1/project/{projectId}/task/{taskId}/complete */
  async completeTask(projectId: string, taskId: string): Promise<void> {
    await this.request<void>(`/project/${projectId}/task/${taskId}/complete`, {
      method: 'POST',
    })
  }

  /** DELETE /open/v1/project/{projectId}/task/{taskId} */
  async deleteTask(projectId: string, taskId: string): Promise<void> {
    await this.request<void>(`/project/${projectId}/task/${taskId}`, {
      method: 'DELETE',
    })
  }

  /** POST /open/v1/task/move */
  async moveTasks(moves: MoveTaskInput[]): Promise<MoveTaskResult[]> {
    return this.request<MoveTaskResult[]>('/task/move', {
      method: 'POST',
      body: JSON.stringify(moves),
    })
  }

  /** POST /open/v1/task/completed */
  async getCompletedTasks(filter: CompletedTaskFilter): Promise<Task[]> {
    return this.request<Task[]>('/task/completed', {
      method: 'POST',
      body: JSON.stringify(filter),
    })
  }

  /** POST /open/v1/task/filter */
  async filterTasks(filter: TaskFilter): Promise<Task[]> {
    return this.request<Task[]>('/task/filter', {
      method: 'POST',
      body: JSON.stringify(filter),
    })
  }

  // --- Project (6 endpoints) ---

  /** GET /open/v1/project */
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/project')
  }

  /** GET /open/v1/project/{projectId} */
  async getProject(projectId: string): Promise<Project> {
    return this.request<Project>(`/project/${projectId}`)
  }

  /** GET /open/v1/project/{projectId}/data */
  async getProjectWithData(projectId: string): Promise<ProjectData> {
    return this.request<ProjectData>(`/project/${projectId}/data`)
  }

  /** POST /open/v1/project */
  async createProject(input: CreateProjectInput): Promise<Project> {
    return this.request<Project>('/project', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  /** POST /open/v1/project/{projectId} */
  async updateProject(projectId: string, input: UpdateProjectInput): Promise<Project> {
    return this.request<Project>(`/project/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  /** DELETE /open/v1/project/{projectId} */
  async deleteProject(projectId: string): Promise<void> {
    await this.request<void>(`/project/${projectId}`, {
      method: 'DELETE',
    })
  }
}

let cachedApi: TickTickApi | null = null

export async function getApi(): Promise<TickTickApi> {
  if (cachedApi) return cachedApi
  const token = await getAccessToken()
  cachedApi = new TickTickApi(token)
  return cachedApi
}

export { TickTickApi }
