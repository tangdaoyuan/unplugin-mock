import path from 'path'
import chokidar from 'chokidar'
import type { ViteDevServer } from 'vite'
import colors from 'picocolors'
import { transformConfig } from '../transform/config'
import logger from '../logger'
import { getIgnoreMatcher } from '../util'
import { setMockHandlerContext } from '../transform/context'
import type { Options } from '@/types'

export function createWatcher(_options: Options, _server: ViteDevServer) {
  const { mockPath, refresh, ignore } = _options
  if (!mockPath)
    return

  const ignoreMatchers = getIgnoreMatcher(ignore)

  const absPath = path.resolve(mockPath)
  const watcher = chokidar
    .watch(`${absPath}`, {
      ignored: ignoreMatchers,
      ignoreInitial: true,
    })
    .on('change', (filePath) => {
      logger.info(`${colors.dim(filePath)} ${colors.green('changed')}`)
      const mockReqData = transformConfig(_options)
      setMockHandlerContext(mockReqData)

      if (refresh)
        _server.ws.send({ type: 'full-reload' })
    })

  const originalClose = _server.close
  _server.close = async() => {
    logger.info(colors.green('closing watcher...'))
    await watcher.close()
    logger.info('watcher closed')
    await originalClose()
  }
}
