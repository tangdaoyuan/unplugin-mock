import path from 'path'
import chokidar from 'chokidar'
import type { ViteDevServer } from 'vite'
import { transformConfig } from '../transform/config'
import { MOCK_DATA_KEY, requestContext } from '../transform/request'
import type { Options } from '@/types'

const dotFile = /(^|[\/\\])\../

export function createWatcher(_options: Options, _server: ViteDevServer) {
  const { mockPath, refresh } = _options
  if (!mockPath)
    return

  const absPath = path.resolve(mockPath)
  const watcher = chokidar
    .watch(`${absPath}`, {
      ignored: dotFile,
      ignoreInitial: true,
    })
    .on('change', (filePath) => {
      // eslint-disable-next-line no-console
      console.log(`[vite:un-mock] ${filePath} changed`)
      const mockReqData = transformConfig(_options)
      requestContext.set(MOCK_DATA_KEY, mockReqData)

      if (refresh)
        _server.ws.send({ type: 'full-reload' })
    })

  const originalClose = _server.close
  _server.close = async() => {
    // eslint-disable-next-line no-console
    console.log('[vite:un-mock] close')
    await watcher.close()
    await originalClose()
  }
}
