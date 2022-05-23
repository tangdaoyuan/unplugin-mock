import path from 'path'
import { beforeAll, describe, expect, it } from 'vitest'
import { buildCjsFile, transformConfig } from '@/transform/config'
import type { MockHandler } from '@/types'
import { setMockData, transformRequest } from '@/transform/request'

const mockPath = path.resolve(__dirname, './fixture')

describe('runs mock file transform', () => {
  it('works', () => {
    const result = transformConfig({
      mockPath,
    })
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })
  it('generate cjs for single mock file', () => {
    const code = buildCjsFile('./fixture/mock/mock.ts')
    expect(code).toMatchSnapshot()
  })
})

describe('runs mock request transform', () => {
  let mockList: MockHandler[] = []
  beforeAll(() => {
    mockList = transformConfig({
      mockPath,
    })
    setMockData(mockList)
  })

  it('get json response', () => {
    const mockData = transformRequest({
      url: '/api/get',
      method: 'get',
    })
    expect(mockData).toMatchInlineSnapshot(`
      {
        "method": "get",
        "response": [Function],
        "url": "/api/get",
      }
    `)
  })
  it('post function response', () => {
    const mockData = transformRequest({
      url: '/api/post',
      method: 'post',
    })
    expect(mockData).toMatchInlineSnapshot(`
      {
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
        "method": "post",
        "response": [Function],
        "url": "/api/post",
      }
    `)
  })
})
