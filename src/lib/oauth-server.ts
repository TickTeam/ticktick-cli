import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'

const PORT = 8765
const TIMEOUT_MS = 3 * 60 * 1000

const SUCCESS_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Connected - TickTick CLI</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f5f5f5; color: #333;
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
  }
  .container { text-align: center; padding: 48px 24px; max-width: 480px; }
  .check { font-size: 64px; margin-bottom: 16px; }
  h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
  p { font-size: 15px; color: #666; line-height: 1.6; }
  code { background: #e8e8e8; padding: 2px 8px; border-radius: 4px; font-size: 13px; }
</style></head>
<body><div class="container">
  <div class="check">&#x2705;</div>
  <h1>Connected</h1>
  <p>You are signed in. Close this window and return to the terminal.</p>
  <p style="margin-top:16px"><code>ticktick project list</code></p>
</div></body></html>`

const ERROR_HTML = (message: string) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Error - TickTick CLI</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f5f5f5; color: #333;
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
  }
  .container { text-align: center; padding: 48px 24px; max-width: 480px; }
  .icon { font-size: 64px; margin-bottom: 16px; }
  h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
  p { font-size: 15px; color: #666; line-height: 1.6; }
  code { background: #e8e8e8; padding: 2px 8px; border-radius: 4px; font-size: 13px; }
</style></head>
<body><div class="container">
  <div class="icon">&#x274C;</div>
  <h1>Authentication failed</h1>
  <p>${message}</p>
  <p style="margin-top:16px">Run <code>ticktick auth login</code> to try again</p>
</div></body></html>`

export function startCallbackServer(expectedState: string): {
  promise: Promise<string>
  cleanup: () => void
} {
  let server: Server | null = null
  let timeoutId: NodeJS.Timeout | null = null

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    if (server) {
      server.close()
      server = null
    }
  }

  const promise = new Promise<string>((resolve, reject) => {
    const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url || '/', `http://localhost:${PORT}`)

      if (url.pathname !== '/callback') {
        res.writeHead(404)
        res.end('Not found')
        return
      }

      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      const error = url.searchParams.get('error')

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(ERROR_HTML(error))
        cleanup()
        reject(new Error(`OAuth error: ${error}`))
        return
      }

      if (!code || !state) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(ERROR_HTML('Missing code or state parameter'))
        cleanup()
        reject(new Error('Missing code or state parameter'))
        return
      }

      if (state !== expectedState) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(ERROR_HTML('Invalid state parameter (possible CSRF attack)'))
        cleanup()
        reject(new Error('Invalid state parameter'))
        return
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(SUCCESS_HTML)
      cleanup()
      resolve(code)
    }

    server = createServer(handleRequest)

    server.on('error', (err) => {
      cleanup()
      reject(err)
    })

    server.listen(PORT, () => {
      timeoutId = setTimeout(() => {
        cleanup()
        reject(new Error('OAuth callback timed out'))
      }, TIMEOUT_MS)
    })
  })

  return { promise, cleanup }
}

export const OAUTH_REDIRECT_URI = `http://localhost:${PORT}/callback`
