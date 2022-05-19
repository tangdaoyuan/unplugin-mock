import { createUnplugin } from 'unplugin'
import { transformRequest } from './transform'
import type { GeneralOptions } from './types'

export default createUnplugin<GeneralOptions>((_options, _meta) => {
  return {
    name: 'unplugin-mock',
    vite: {
      configResolved(config) {
        // init local mock server from config
        // eslint-disable-next-line no-console
        console.log(config)
      },
      configureServer(server) {
        server.middlewares.use(transformRequest)
      },
    },
  }
})
