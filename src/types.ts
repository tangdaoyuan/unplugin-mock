import type { IncomingMessage, ServerResponse } from 'http'

export interface Options {
  verbose?: boolean
  mockPath: string
  refresh: boolean
  ignore: string | RegExp | (string | RegExp)[]
}

export type GeneralOptions = Partial<Options>

export interface ExposeNodeModule extends NodeModule {
  _compile: (rawCode: string, fileName: string) => void
}

export type MockRespData = Object

export type MockRespFunc = ((_req: IncomingMessage, _res: ServerResponse) => void) | ((_req: IncomingMessage, _res: ServerResponse) => Promise<Object | void>)

export interface MockHandler {
  url: string
  method: string
  response: MockRespData | MockRespFunc
}

export interface ModuleMockHandler extends MockHandler {
  _file: string
}
