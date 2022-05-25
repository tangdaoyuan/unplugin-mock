/* eslint-disable no-console */
import colors from 'picocolors'

const prefix = colors.bold('[unplugin:mock]')

class Logger {
  static info(message: string) {
    console.log(`${colors.dim(new Date().toLocaleTimeString())} ${colors.cyan(prefix)} ${message}`)
  }

  static warn(message: string) {
    console.log(`${colors.dim(new Date().toLocaleTimeString())} ${colors.yellow(prefix)} ${message}`)
  }

  static error(message: string) {
    console.log(`${colors.dim(new Date().toLocaleTimeString())} ${colors.red(prefix)} ${message}`)
  }
}

export default Logger
