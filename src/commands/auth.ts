import { randomBytes } from 'node:crypto'
import chalk from 'chalk'
import { Command } from 'commander'
import open from 'open'
import { clearAccessToken, getAccessToken, saveAccessToken } from '../lib/auth.js'
import { startCallbackServer } from '../lib/oauth-server.js'
import { buildAuthorizationUrl, exchangeCodeForToken, generatePkceChallenge } from '../lib/oauth.js'

async function loginWithOAuth(): Promise<void> {
  const state = randomBytes(16).toString('hex')
  const { codeVerifier, codeChallenge } = generatePkceChallenge()

  console.log('Opening browser for TickTick sign-in...')

  const authUrl = buildAuthorizationUrl(state, codeChallenge)
  const { promise: callbackPromise, cleanup } = startCallbackServer(state)

  try {
    await open(authUrl)
    console.log(chalk.dim('Waiting for you to authorize in the browser...'))

    const code = await callbackPromise
    console.log(chalk.dim('Exchanging authorization code for token...'))

    const accessToken = await exchangeCodeForToken(code, codeVerifier)
    await saveAccessToken(accessToken)

    console.log(chalk.green('✓'), 'Signed in successfully')
  } catch (error) {
    cleanup()
    throw error
  }
}

async function showStatus(): Promise<void> {
  try {
    const token = await getAccessToken()
    console.log(chalk.green('✓'), 'Signed in')
    console.log(`  Token: ${token.slice(0, 8)}...${token.slice(-4)}`)
  } catch {
    console.log(chalk.yellow('Not signed in'))
    console.log(chalk.dim('Run `ticktick auth login` to sign in'))
  }
}

async function logout(): Promise<void> {
  await clearAccessToken()
  console.log(chalk.green('✓'), 'Token cleared')
}

async function setToken(token: string): Promise<void> {
  await saveAccessToken(token)
  console.log(chalk.green('✓'), 'Token saved')
}

export function registerAuthCommand(program: Command): void {
  const auth = program.command('auth').description('OAuth and token storage')

  auth.command('login').description('Sign in via OAuth (PKCE, opens browser)').action(loginWithOAuth)

  auth
    .command('token')
    .description('Set access token directly')
    .argument('<token>', 'access token string')
    .action(setToken)

  auth.command('status').description('Print whether a token is stored').action(showStatus)

  auth.command('logout').description('Delete stored token').action(logout)
}
