import type { IncomingMessage, ServerResponse } from 'http'
import { createContext as createKoaContext } from 'http-api-utils'
import colors from 'picocolors'
import type { ResolvedConfig } from 'vite'
import logger from '../logger'
import { getMockHandler } from './context'
import type { MockRespFunc, ModuleMockHandler } from '@/types'

export const QUICK_MOCK_DATA_KEY = 'quickReqData'
export const REGEX_MOCK_DATA_KEY = 'restReqData'

export function transformRequest(
  req: Pick<IncomingMessage, 'url' | 'method'>,
) {
  const mockData = getMockHandler(req.url, req.method)

  if (mockData)
    wrapperHandler(mockData)

  return mockData
}

function wrapperHandler(handler: ModuleMockHandler) {
  const { response } = handler
  if (typeof response === 'object') {
    const originalRespData = response as Object
    handler.response = (_req, _res) => {
      _res.body = originalRespData
      _res.end()
    }
  }
  if (typeof response === 'function') {
    const originalRespFunc = response as MockRespFunc
    handler.response = async(_req, _res, context) => {
      const result = await originalRespFunc(_req, _res, context)

      if (_res.writable) {
        if (result)
          _res.body = result

        _res.end()
      }
    }
  }

  return handler
}

export function createTransformRequest(_config?: ResolvedConfig) {
  return async(_req: IncomingMessage,
    _res: ServerResponse,
    _next: (err?: any) => void,
  ) => {
    const handler = transformRequest(_req)
    if (handler) {
      const msg = `${colors.green('request hit')} ${colors.dim(_req.url)}`
      logger.info(msg)
      try {
        const context = createKoaContext(_req, _res)
        await (handler.response as Function)(context.request, context.response, context)
      }
      catch (error) {
        logger.error(colors.red((error as any).message))
      }
      return
    }
    _next()
  }
}
