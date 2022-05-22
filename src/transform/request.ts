import type { IncomingMessage, ServerResponse } from 'http'

export function transformRequest(
  _req: IncomingMessage,
  _res: ServerResponse,
  _next: (err?: any) => void,
): void {
  // eslint-disable-next-line no-console
  console.log(_req.url, _req.method)
  // TODO
  // filter url and method from request, mapping to mockData
  _next()
}
