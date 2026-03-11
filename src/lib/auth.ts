import { readConfig, updateConfig, writeConfig } from './config.js'

export async function getAccessToken(): Promise<string> {
  const config = await readConfig()
  if (config.access_token) {
    return config.access_token
  }

  throw new Error('No access token found. Run `ticktick auth login` to sign in.')
}

export async function saveAccessToken(token: string): Promise<void> {
  if (!token || token.trim().length < 10) {
    throw new Error('Invalid token: must be at least 10 characters')
  }
  await updateConfig({ access_token: token.trim() })
}

export async function clearAccessToken(): Promise<void> {
  const config = await readConfig()
  delete config.access_token
  await writeConfig(config)
}
