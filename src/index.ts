import path from 'path'
import { createUnplugin } from 'unplugin'
import type { GeneralOptions } from './types'

export default createUnplugin<GeneralOptions>((_options, _meta) => {
  return {
    name: 'unplugin-mock',
    transformInclude(id) {
      if (id.includes('node_modules'))
        return false

      if (path.extname(id))
        return true
      return false
    },
  }
})
