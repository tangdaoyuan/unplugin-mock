import colors from 'picocolors'
import { parse } from 'regexparam'
import logger from '../logger'
import type { MockKoaContext, ModuleMockHandler } from '@/types'

export const QUICK_MOCK_DATA_KEY = 'quickReqData'
export const REGEX_MOCK_DATA_KEY = 'restReqData'

const quickHandlerStore = new Map<string, ModuleMockHandler>()
const regexHandlerStore = new Array<ModuleMockHandler>()

export function getMockHandler(url?: string, method?: string) {
  if (!url || !method)
    return null

  const handler = quickHandlerStore.get(`${method.toLowerCase()} ${url}`)
  if (handler)
    return handler

  for (const handler of regexHandlerStore) {
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
    regexHandlerStore.splice(0, regexHandlerStore.length)
    quickHandlerStore.clear()
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
      regexHandlerStore.push(handler)
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
      quickHandlerStore.set(key, handler)
    })
}

export function parseRoute(handler: ModuleMockHandler, context: MockKoaContext): MockKoaContext {
  const matcher = parse(handler.url)
  if (context.request.URL?.pathname) {
    const routes = _parseRoutes(context.request.URL?.pathname, matcher)
    context.request.routes = routes
  }
  else if (context.request.url) {
    const routes = _parseRoutes(
      new URL(context.request.url, `http://${context.req.headers?.host || 'localhost'}`).pathname,
      matcher,
    )
    context.request.routes = routes
  }
  return context
}

function _parseRoutes(
  path: string,
  result: {
    keys: string[]
    pattern: RegExp
  }) {
  const out: Record<string, string | null> = {}
  const matches = result.pattern.exec(path)
  if (!matches)
    return out

  result.keys.forEach((val: string, ind: number) => {
    out[val] = matches[ind + 1] || null
  })

  return out
}
