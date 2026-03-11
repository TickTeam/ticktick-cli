import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const CONFIG_PATH = join(homedir(), '.config', 'ticktick-cli', 'config.json')

export interface Config {
  access_token?: string
}

export async function readConfig(): Promise<Config> {
  try {
    const content = await readFile(CONFIG_PATH, 'utf-8')
    return JSON.parse(content) as Config
  } catch {
    return {}
  }
}

export async function writeConfig(config: Config): Promise<void> {
  const configDir = dirname(CONFIG_PATH)
  await mkdir(configDir, { recursive: true })
  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`)
}

export async function updateConfig(partial: Partial<Config>): Promise<void> {
  const existing = await readConfig()
  await writeConfig({ ...existing, ...partial })
}
