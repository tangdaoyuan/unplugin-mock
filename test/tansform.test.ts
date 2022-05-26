import { fileURLToPath } from 'url'
import type { IncomingMessage, ServerResponse } from 'http'
import type { SpyInstance } from 'vitest'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildCjsFile, transformConfig } from '@/transform/config'
import { getMockHandler, setMockHandlerContext, transformRequest } from '@/transform/request'
import type { MockRespFunc, ModuleMockHandler } from '@/types'

const mockPath = fileURLToPath(new URL('./fixture', import.meta.url))

const pluginOptions = {
  mockPath,
  refresh: false,
  ignore: [],
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

describe('runs file transform', () => {
  it('generate cjs for single mock file', () => {
    const code = buildCjsFile(fileURLToPath(new URL('./fixture/base.ts', import.meta.url)))
    expect(code).toMatchSnapshot()
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
    expect(mockData).toMatchInlineSnapshot(`
      {
        "_file": "/Users/tangdaoyuan/myspaces/plugin_stack/unplugin-mock/test/fixture/index.ts",
        "method": "post",
        "response": [Function],
        "url": "/api/post",
      }
    `)
  })
  it('patch function response', () => {
    const mockData = transformRequest({
      url: '/api/post',
      method: 'post',
    })
    expect(mockData).toMatchInlineSnapshot(`
      {
        "_file": "/Users/tangdaoyuan/myspaces/plugin_stack/unplugin-mock/test/fixture/index.ts",
        "method": "post",
        "response": [Function],
        "url": "/api/post",
      }
    `)
  })
  it('params function response', () => {
    const mockData = transformRequest({
      url: '/api/params/Tedy',
      method: 'get',
    })
    expect(mockData).toMatchInlineSnapshot(`
      {
        "_file": "/Users/tangdaoyuan/myspaces/plugin_stack/unplugin-mock/test/fixture/index.ts",
        "method": "get",
        "response": [Function],
        "url": "/api/params/:name/:id?",
      }
    `)
    const multipleParamsData = transformRequest({
      url: '/api/params/Tedy/1',
      method: 'get',
    })
    expect(multipleParamsData).toMatchInlineSnapshot(`
      {
        "_file": "/Users/tangdaoyuan/myspaces/plugin_stack/unplugin-mock/test/fixture/index.ts",
        "method": "get",
        "response": [Function],
        "url": "/api/params/:name/:id?",
      }
    `)
  })
  it('promise response', async() => {
    vi.useFakeTimers()
    const mockData = transformRequest({
      url: '/api/promise',
      method: 'get',
    })
    expect(mockData).not.toBeNull()

    const _req = {
      writeHead: vi.fn(),
      end: vi.fn(),
    } as unknown as IncomingMessage
    const _res = {
      writeHead: vi.fn(),
      end: vi.fn(),
    } as unknown as ServerResponse

    const result = (mockData!.response as MockRespFunc)(_req, _res)
    expect(result).toBeInstanceOf(Promise)
    expect(result).resolves.toBeDefined()
    vi.useRealTimers()
  })
})
