#!/usr/bin/env node

import { type Command, program } from 'commander'

program
  .name('ticktick')
  .description('TickTick CLI – manage tasks and projects from the terminal')
  .version('0.1.4')
  .option('--json', 'Output as JSON (global default for subcommands)')

const commands: Record<string, [string, () => Promise<(p: Command) => void>]> = {
  auth: [
    'OAuth and token storage',
    async () => (await import('./commands/auth.js')).registerAuthCommand,
  ],
  task: [
    'Create, update, and query tasks',
    async () => (await import('./commands/task.js')).registerTaskCommand,
  ],
  project: [
    'List and manage projects',
    async () => (await import('./commands/project.js')).registerProjectCommand,
  ],
}

for (const [name, [description]] of Object.entries(commands)) {
  program.command(name).description(description)
}

const commandName = process.argv.slice(2).find((a) => !a.startsWith('-') && a in commands)

if (commandName && commands[commandName]) {
  const idx = program.commands.findIndex((c) => c.name() === commandName)
  if (idx !== -1) (program.commands as Command[]).splice(idx, 1)
  const loader = commands[commandName][1]
  const register = await loader()
  register(program)
}

program
  .parseAsync()
  .catch((err: Error) => {
    console.error(err.message)
    process.exit(1)
  })
