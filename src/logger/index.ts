/* eslint-disable no-console */
import colors from 'picocolors'

const prefix = colors.cyan(colors.bold('[unplugin:mock]'))

class Logger {
  static info(message: string) {
    console.log(`${colors.dim(new Date().toLocaleTimeString())} ${prefix} ${message}`)
  }

  static error(message: string) {
    console.error(`${colors.dim(new Date().toLocaleTimeString())} ${prefix} ${message}`)
  }
}

export default Logger
