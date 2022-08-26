import { fileURLToPath } from 'url'
import type { IncomingMessage } from 'http'
import { ServerResponse } from 'http'
import type { SpyInstance } from 'vitest'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Context, Request, Response } from 'http-api-utils'
import normalize from 'normalize-path'
import { transformConfig } from '@/transform/config'
import { getMockHandler, setMockHandlerContext } from '@/transform/context'
import type { MockRespFunc, ModuleMockHandler } from '@/types'
import { createContext, transformRequest } from '@/transform/request'

const mockPath = fileURLToPath(new URL('./fixture', import.meta.url))

const pluginOptions = {
  mockPath: normalize(mockPath),
  refresh: false,
  ignore: [],
  enable: true,
  extension: ['.js', '.ts'],
}

describe('runs detect', () => {
  it('works', () => {
    const result = transformConfig(pluginOptions)
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('ignore file', () => {
    const result = transformConfig({ ...pluginOptions, ignore: ['**/ignore.ts'] })
    expect(result.some(r => r.url === '/api/ignore')).toBe(false)
  })
})

describe('runs set/get handler', () => {
  let $consoleLog: SpyInstance | null = null
  beforeEach(() => {
    $consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })
  afterEach(() => {
    if ($consoleLog) {
      $consoleLog.mockRestore()
      $consoleLog = null
    }
  })
  it('simple context works', () => {
    setMockHandlerContext([{
      url: '/api/test',
      method: 'GET',
      response: {},
      _file: '_local_mock_file_',
    }])
    const mockData = getMockHandler('/api/test', 'GET')
    expect(mockData).not.toBeNull()
  })
  it('regex context works', () => {
    setMockHandlerContext([{
      url: '/api/test/:id',
      method: 'GET',
      response: {},
      _file: '_local_mock_file_',
    }])
    const mockData = getMockHandler('/api/test/1', 'GET')
    expect(mockData).not.toBeNull()
  })
  it('simple context conflict', () => {
    setMockHandlerContext([{
      url: '/api/test',
      method: 'GET',
      response: {},
      _file: '_local_simple_mock_file_1',
    }, {
      url: '/api/test',
      method: 'GET',
      response: {},
      _file: '_local_simple_mock_file_2',
    }])
    expect($consoleLog).toBeCalledTimes(1)
  })
  it('regex context conflict', () => {
    setMockHandlerContext([{
      url: '/api/test/:id',
      method: 'GET',
      response: {},
      _file: '_local_regex_mock_file_1',
    }, {
      url: '/api/test/:id',
      method: 'GET',
      response: {},
      _file: '_local_regex_mock_file_2',
    }])
    expect($consoleLog).toBeCalledTimes(1)
  })
  it('mix context conflict', () => {
    setMockHandlerContext([{
      url: '/api/test/:id',
      method: 'GET',
      response: {},
      _file: '_local_regex_mock_file_',
    }, {
      url: '/api/test/info',
      method: 'GET',
      response: {},
      _file: '_local_simple_mock_file_',
    }])
    expect($consoleLog).toBeCalledTimes(1)
  })
  it('method case ignore', () => {
    setMockHandlerContext([{
      url: '/api/test/:id',
      method: 'GET',
      response: {},
      _file: '_local_regex_mock_file_',
    }, {
      url: '/api/test/info',
      method: 'get',
      response: {},
      _file: '_local_simple_mock_file_',
    }])
    expect($consoleLog).toBeCalledTimes(1)
    expect(getMockHandler('/api/test/info', 'GET')).not.toBeNull()
  })
})

describe('runs mock request transform', () => {
  let mockList: ModuleMockHandler[] = []
  beforeAll(() => {
    mockList = transformConfig(pluginOptions)
    setMockHandlerContext(mockList)
  })
  afterAll(() => {
    setMockHandlerContext([])
  })

  it('get json response', () => {
    const mockData = transformRequest({
      url: '/api/get',
      method: 'get',
    })
    expect(mockData).not.toBeNull()
  })
  it('post function response', () => {
    const mockData = transformRequest({
      url: '/api/post',
      method: 'post',
    })
    expect(mockData).toBeDefined()
  })
  it('patch function response', () => {
    const mockData = transformRequest({
      url: '/api/post',
      method: 'post',
    })
    expect(mockData).toBeDefined()
  })
  it('params function response', () => {
    const mockData = transformRequest({
      url: '/api/params/Tedy',
      method: 'get',
    })
    expect(mockData).toBeDefined()
    const multipleParamsData = transformRequest({
      url: '/api/params/Tedy/1',
      method: 'get',
    })
    expect(multipleParamsData).toBeDefined()
  })
  it('promise response', async() => {
    vi.useFakeTimers()
    const mockData = transformRequest({
      url: '/api/promise',
      method: 'get',
    })
    expect(mockData).not.toBeNull()

    const _req = {} as unknown as Request
    const _res = {
      end: vi.fn(),
    } as unknown as Response

    const _ctx = {} as unknown as Context

    const result = (mockData!.response as MockRespFunc)(_req, _res, _ctx)
    expect(result).toBeInstanceOf(Promise)
    expect(result).resolves.toBeDefined()
    vi.useRealTimers()
  })
  it('req url params', async() => {
    const mockData = transformRequest({
      url: '/api/params/1/2',
      method: 'get',
    })
    expect(mockData).not.toBeNull()

    const _req = {
      url: '/api/params/1/2?search=Tedy&page=1&size=10',
    } as unknown as IncomingMessage

    const _res = new ServerResponse(_req)

    const context = createContext(_req, _res, mockData!)

    const result = (mockData!.response as MockRespFunc)(context.request, context.response, context)
    expect(result).toBeInstanceOf(Promise)
    const res = await result
    expect(res).toMatchInlineSnapshot('undefined')
    expect(context.response.body).toMatchInlineSnapshot(`
      {
        "code": 0,
        "data": {
          "id": "2",
          "msg": "Tedy Params Match",
          "name": "1",
        },
      }
    `)
  })
})
