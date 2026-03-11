import { createHash, randomBytes } from 'node:crypto'
import { OAUTH_REDIRECT_URI } from './oauth-server.js'

const OAUTH_AUTHORIZE_URL = 'https://ticktick.com/oauth/authorize'
const OAUTH_TOKEN_URL = 'https://ticktick.com/oauth/token'
const OAUTH_SCOPES = 'tasks:write tasks:read'
const CLIENT_ID = 'k3pIbVGM1LCipb08mu'

export interface PkceChallenge {
  codeVerifier: string
  codeChallenge: string
}

export function generatePkceChallenge(): PkceChallenge {
  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
  return { codeVerifier, codeChallenge }
}

export function buildAuthorizationUrl(
  state: string,
  codeChallenge: string,
): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: OAUTH_SCOPES,
    state,
    redirect_uri: OAUTH_REDIRECT_URI,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`
}

interface TokenResponse {
  access_token: string
  token_type: string
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
): Promise<string> {
  const body = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    scope: OAUTH_SCOPES,
    redirect_uri: OAUTH_REDIRECT_URI,
  })

  const response = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Token exchange failed: ${response.status} ${text}`)
  }

  const data: TokenResponse = await response.json()
  return data.access_token
}
