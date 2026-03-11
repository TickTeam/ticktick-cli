import yoctoSpinner from 'yocto-spinner'

let spinner: ReturnType<typeof yoctoSpinner> | null = null

export function startSpinner(text = 'Loading...'): void {
  spinner = yoctoSpinner({ text }).start()
}

export function stopSpinner(): void {
  if (spinner) {
    spinner.stop()
    spinner = null
  }
}
