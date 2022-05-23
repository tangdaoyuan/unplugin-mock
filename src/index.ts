import { createUnplugin } from 'unplugin'
import type { ResolvedConfig } from 'vite'
import { defaultOptions } from './options'
import { transformConfig } from './transform/config'
import { MOCK_DATA_KEY, createTransformRequest, requestContext } from './transform/request'
import type { GeneralOptions } from './types'

export default createUnplugin<GeneralOptions>((_options, _meta) => {
  const options = { ...defaultOptions, ..._options }
  let config: ResolvedConfig | undefined

  return {
    name: 'unplugin-mock',
    vite: {
      configResolved(_config) {
        config = _config
        // init local mock server from config
        const mockReqData = transformConfig(options)
        requestContext.set(MOCK_DATA_KEY, mockReqData)

        // TODO
        // watchFiles change
      },
      configureServer(server) {
        server.middlewares.use(createTransformRequest(config))
      },
    },
  }
})
