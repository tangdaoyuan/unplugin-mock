import { createUnplugin } from 'unplugin'
import { defaultOptions } from './options'
import { transformConfig } from './transform/config'
import { MOCK_DATA_KEY, createTransformRequest } from './transform/request'
import type { GeneralOptions } from './types'

export default createUnplugin<GeneralOptions>((_options, _meta) => {
  const options = { ...defaultOptions, ..._options }
  const context = new Map<string, any>([[MOCK_DATA_KEY, []]])

  return {
    name: 'unplugin-mock',
    vite: {
      configResolved(_config) {
        // init local mock server from config
        const mockReqData = transformConfig(options)
        context.set('mockReqData', mockReqData)

        // TODO
        // watchFiles change
      },
      configureServer(server) {
        server.middlewares.use(createTransformRequest(context))
      },
    },
  }
})
