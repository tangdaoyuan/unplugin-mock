import type { Context, Request, Response } from 'http-api-utils'

export interface Options {
  verbose?: boolean
  enable: boolean
  mockPath: string
  refresh: boolean
  ignore: string | RegExp | (string | RegExp)[]
}

export type GeneralOptions = Partial<Options>

export interface ExposeNodeModule extends NodeModule {
  _compile: (rawCode: string, fileName: string) => void
}

export type MockRespData = Object

export type MockRespFunc =
((_req: Request, _res: Response, context: Context) => void) |
((_req: Request, _res: Response, context: Context) => Promise<Object | void>)

export interface MockHandler {
  url: string
  method: string
  response: MockRespData | MockRespFunc
}

export interface ModuleMockHandler extends MockHandler {
  _file: string
}
