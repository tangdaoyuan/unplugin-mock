import { createUnplugin } from 'unplugin'
import { defaultOptions } from './options'
import { transformConfig } from './transform/config'
import { transformRequest } from './transform/request'
import type { GeneralOptions } from './types'

export default createUnplugin<GeneralOptions>((_options, _meta) => {
  const options = { ...defaultOptions, ..._options }
  return {
    name: 'unplugin-mock',
    vite: {
      configResolved(_config) {
        // init local mock server from config
        transformConfig(options)
      },
      configureServer(server) {
        server.middlewares.use(transformRequest)
      },
    },
  }
})
