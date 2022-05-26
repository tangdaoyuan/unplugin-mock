import type { IncomingMessage, ServerResponse } from 'http'
import type { ResolvedConfig } from 'vite'
import { parse } from 'regexparam'
import colors from 'picocolors'
import logger from '../logger'
import type { MockRespFunc, ModuleMockHandler } from '@/types'

export const QUICK_MOCK_DATA_KEY = 'quickReqData'
export const REGEX_MOCK_DATA_KEY = 'restReqData'

const quickHandlerContext = new Map<string, ModuleMockHandler>()
const regexHandlerContext = new Array<ModuleMockHandler>()

export function transformRequest(
  req: Pick<IncomingMessage, 'url' | 'method'>,
) {
  // TODO
  // pick from cache
  // filter url and method from request, mapping to mockData
  const mockData = getMockHandler(req.url, req.method)

  if (mockData)
    wrapperHandler(mockData)

  return mockData
}

export type ResponseHandler = (_req: IncomingMessage, _res: ServerResponse) => (Object | void) | Promise<Object | void>

function wrapperHandler(handler: ModuleMockHandler) {
  const { response } = handler
  if (typeof response === 'object') {
    const originalRespData = response as Object
    handler.response = (_req, _res) => outputJson(_req, _res, originalRespData)
  }
  if (typeof response === 'function') {
    const originalRespFunc = response as MockRespFunc
    handler.response = async(_req, _res) => {
      // TODO
      // enhance _req, _res for mock
      const result = await originalRespFunc(_req, _res)
      if (result)
        outputJson(_req, _res, result)
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
        await (handler.response as Function)(_req, _res)
      }
      catch (error) {
        logger.error(colors.red((error as any).message))
      }
      return
    }
    _next()
  }
}

export function getMockHandler(url?: string, method?: string) {
  if (!url || !method)
    return null

  const handler = quickHandlerContext.get(`${method.toLowerCase()} ${url}`)
  if (handler)
    return handler

  for (const handler of regexHandlerContext) {
    const { url: _url, method: _method } = handler
    const matcher = parse(_url)
    if ((matcher.pattern.test(url) || handler.url === url)
      && _method.toLowerCase() === method.toLowerCase()
    )
      return handler
  }
  return null
}

export function setMockHandlerContext(values: ModuleMockHandler[], reset = true) {
  const logConflict = (source: ModuleMockHandler, target: ModuleMockHandler) => {
    logger.warn(`${colors.yellow('handler conflict as follows:')}
      ${colors.dim(colors.green(`${source.method.toUpperCase()} ${source.url}`))} ${colors.yellow(source._file)}
      ${colors.dim(colors.green(`${target.method.toUpperCase()} ${target.url}`))} ${colors.yellow(target._file)}`)
  }

  if (reset) {
    regexHandlerContext.splice(0, regexHandlerContext.length)
    quickHandlerContext.clear()
  }

  // restful priority > quick priority
  values
    .filter(handler => parse(handler.url).keys.length)
    .forEach((handler) => {
      const h = getMockHandler(handler.url, handler.method)
      if (h) {
        logConflict(handler, h)
        return
      }
      regexHandlerContext.push(handler)
    })
  values
    .filter(handler => !parse(handler.url).keys.length)
    .forEach((handler) => {
      const h = getMockHandler(handler.url, handler.method)
      if (h) {
        logConflict(handler, h)
        return
      }
      const key = `${handler.method.toLowerCase()} ${handler.url}`
      quickHandlerContext.set(key, handler)
    })
}

function outputJson(_req: IncomingMessage, res: ServerResponse, data: Object) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}
