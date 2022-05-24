import type { IncomingMessage, ServerResponse } from 'http'
import type { ResolvedConfig } from 'vite'
import { parse } from 'regexparam'
import colors from 'picocolors'
import logger from '../logger'
import type { MockHandler } from '@/types'

export const MOCK_DATA_KEY = 'mockReqData'
export const requestContext = new Map<string, MockHandler[]>([[MOCK_DATA_KEY, []]])

export function setMockData(mockData: MockHandler[]) {
  requestContext.set(MOCK_DATA_KEY, mockData)
}

export function transformRequest(
  req: Pick<IncomingMessage, 'url' | 'method'>,
) {
  // TODO
  // pick from cache
  // filter url and method from request, mapping to mockData
  const mockDataList = (requestContext.get(MOCK_DATA_KEY) || [])
  const mockData = mockDataList.find(
    (mock) => {
      const { url, method } = mock
      const matcher = parse(url)

      return (matcher.pattern.test(req.url || '') || url === req.url)
        && method.toUpperCase() === req.method?.toUpperCase()
    },
  )

  if (mockData)
    wrapperHandler(mockData)

  return mockData
}

function wrapperHandler(handler: MockHandler) {
  const { response } = handler
  if (typeof response === 'object') {
    const originalRespData = response as Object
    handler.response = (_req, _res) => outputJson(_req, _res, originalRespData)
  }
  if (typeof response === 'function') {
    const originalRespFunc = response as (_req: unknown, _res: unknown) => Object
    handler.response = (_req, _res) => {
      // TODO
      // enhance _req, _res for mock
      const result = originalRespFunc(_req, _res)
      if (result)
        outputJson(_req, _res, result)
    }
  }

  return handler
}

export function createTransformRequest(_config?: ResolvedConfig) {
  return (_req: IncomingMessage,
    _res: ServerResponse,
    _next: (err?: any) => void,
  ) => {
    const handler = transformRequest(_req)
    if (handler) {
      const msg = `${colors.green('request hit')} ${colors.dim(_req.url)}`
      logger.info(msg)
      ;(handler.response as Function)(_req, _res)
      return
    }
    _next()
  }
}

function outputJson(_req: IncomingMessage, res: ServerResponse, data: Object) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}
