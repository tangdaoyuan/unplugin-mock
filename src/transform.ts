import type { IncomingMessage, ServerResponse } from 'http'
import type { TransformResult } from 'unplugin'
import type { Options } from './types'

export function transform(_code: string, _id: string, _options: Options): TransformResult {
  return ''
}

export function transformRequest(
  _req: IncomingMessage,
  _res: ServerResponse,
  _next: (err?: any) => void,
): void {
  // eslint-disable-next-line no-console
  console.log(_req.url, _req.method)
  // TODO
  // filter url and method from request, mapping to mock server
  _next()
}
