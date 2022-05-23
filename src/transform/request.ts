import type { IncomingMessage, ServerResponse } from 'http'
import type { ResolvedConfig } from 'vite'
import type { MockHandler } from '@/types'

export const MOCK_DATA_KEY = 'mockReqData'
export const requestContext = new Map<string, MockHandler[]>([[MOCK_DATA_KEY, []]])

export function transformRequest(
  _req: IncomingMessage,
  _res: ServerResponse,
  _next: (err?: any) => void,
): void {
  // TODO
  // filter url and method from request, mapping to mockData
  const mockDataList = (requestContext.get(MOCK_DATA_KEY) || [])
  const mockData = mockDataList.find(
    mock => mock.url === _req.url && (mock.method as string).toUpperCase() === _req.method,
  )
  if (mockData) {
    _res.writeHead(200, { 'Content-Type': 'application/json' })
    _res.end(JSON.stringify({ code: 0, data: 'it works!' }))
    return
  }
  _next()
}

export function createTransformRequest(_config?: ResolvedConfig) {
  return (_req: IncomingMessage,
    _res: ServerResponse,
    _next: (err?: any) => void,
  ) => {
    transformRequest(_req, _res, _next)
  }
}
