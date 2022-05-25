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

type MockRespData = Object

type MockRespFunc = (_req: IncomingMessage, _res: ServerResponse) => void

export interface MockHandler {
  url: string
  method: string
  response: MockRespData | MockRespFunc
}

export interface ModuleMockHandler extends MockHandler {
  _file: string
}
