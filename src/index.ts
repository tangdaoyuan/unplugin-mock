import { createUnplugin } from 'unplugin'
import type { ResolvedConfig } from 'vite'
import { defaultOptions } from './options'
import { transformConfig } from './transform/config'
import { MOCK_DATA_KEY, createTransformRequest, requestContext } from './transform/request'
import type { GeneralOptions } from './types'
import { createWatcher } from './watch'

export default createUnplugin<GeneralOptions>((_options, _meta) => {
  const options = { ...defaultOptions, ..._options }
  let config: ResolvedConfig | undefined

  return {
    name: 'unplugin-mock',
    vite: {
      apply: 'serve',
      configResolved(_config) {
        config = _config
        // init local mock server from config
        const mockReqData = transformConfig(options)
        requestContext.set(MOCK_DATA_KEY, mockReqData)
      },
      configureServer(server) {
        createWatcher(options, server)
        server.middlewares.use(createTransformRequest(config))
      },
    },
  }
})
